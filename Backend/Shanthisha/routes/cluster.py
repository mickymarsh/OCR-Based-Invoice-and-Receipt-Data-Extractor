import os
import joblib
import pandas as pd
import numpy as np
import warnings

# Suppress scikit-learn version mismatch warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
warnings.simplefilter(action='ignore', category=FutureWarning)
import numpy as np
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Body, Depends
# from core.firebase_auth import verify_token

router = APIRouter()

# Path to joblib bundle file
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")
CLUSTER_PIPELINE_PATH = os.path.join(MODEL_DIR, "cluster_pipeline.joblib")

# Model loading helper
def get_bundle():
    try:
        # Check if cluster pipeline exists
        if not os.path.exists(CLUSTER_PIPELINE_PATH):
            raise FileNotFoundError("Cluster pipeline file not found. Please ensure 'cluster_pipeline.joblib' is placed in the correct directory.")
            
        # Load cluster pipeline bundle
        bundle = joblib.load(CLUSTER_PIPELINE_PATH)
        return bundle
    except Exception as e:
        raise RuntimeError(f"Error loading cluster pipeline: {str(e)}")

class ClusterPredictionInput(BaseModel):
    gender: str
    age: int
    income: int  # Monthly income in LKR
    education_level: str
    occupation: str
    marital_status: str
    num_children: int
    location_type: str
    exercise_frequency: str
    car_ownership: int

@router.post("/predict-cluster")
async def predict_cluster(data: ClusterPredictionInput):
    """
    Predict cluster ID based on user data
    """
    try:
        # Load cluster bundle
        bundle = get_bundle()
        
        # Extract components from the bundle
        kmeans = bundle.get("kmeans")
        scaler = bundle.get("scaler")
        # onehot_encoder = bundle.get("onehot_encoder")
        # ordinal_encoder = bundle.get("ordinal_encoder")
        num_cols = bundle.get("num_cols")
        # cat_cols_1 = bundle.get("cat_cols_1")
        # cat_cols_2 = bundle.get("cat_cols_2")
        design_columns = bundle.get("design_columns")  # Feature order used to train KMeans
        
        # Create dataframe from input data with column names matching preprocessing pipeline
        new_df = pd.DataFrame([{
            "Gender": data.gender,
            "Age": data.age,
            "Income (LKR Monthly)": data.income,  # Already in monthly format
            "Education Level": data.education_level,
            "Occupation": data.occupation,
            "Marital Status": data.marital_status,
            "Number of Children": data.num_children,
            "Location Type": data.location_type,
            "Exercise Frequency": data.exercise_frequency,
            "Car Ownership": data.car_ownership
        }])
        
        # First, convert all potential numeric columns using pd.to_numeric with errors='coerce'
        # This will ensure proper handling of any non-numeric values
        potential_numeric_cols = ["Age", "Income (LKR Monthly)", "Car Ownership", "Number of Children"]
        for col in potential_numeric_cols:
            if col in new_df.columns:
                new_df[col] = pd.to_numeric(new_df[col], errors="coerce").fillna(0)
        
        # Add Health Index
        # 1) Make sure Exercise Frequency has no nulls and unify labels
        freq = (
            new_df["Exercise Frequency"]
            .astype(str)
            .str.strip()
            .replace({" No ": "No"})
        )

        # 2) Map exercise → bonus
        ex_map = {"No": 0, "None": 0, "1-2/wk": 5, "3-5/wk": 10, "Daily": 15}
        ex_bonus = freq.map(ex_map).fillna(0).astype(np.float64)

        # 3) Age penalty (only if Age > 42)
        age = pd.to_numeric(new_df["Age"], errors="coerce").fillna(0).astype(np.float64)
        age_penalty = np.clip((age - 40), 0, None)

        # 4) New Health Index, clipped to [0,100]
        health = 65 - age_penalty + ex_bonus
        new_df["Health Index"] = np.clip(health, 0, 100).astype(np.float64)
        
        # Ensure all numeric columns are explicitly float64
        numeric_cols = ["Age", "Income (LKR Monthly)", "Health Index", "Car Ownership", "Number of Children"]
        for col in numeric_cols:
            if col in new_df.columns:
                new_df[col] = pd.to_numeric(new_df[col], errors="coerce").fillna(0).astype(np.float64)
                
        # Apply preprocessing steps in the same order as training
        # 1. Scale numerical features
        if scaler and num_cols:
            new_df[num_cols] = scaler.transform(new_df[num_cols])
            # Ensure scaled values are float64
            for col in num_cols:
                if col in new_df.columns:
                    new_df[col] = new_df[col].astype(np.float64)
        
        # 2. Manual one-hot encoding for categorical features
        # Initialize all one-hot columns to 0 as float64
        ohe_columns = [
            'Location Type_Rural', 'Location Type_Suburban', 'Location Type_Urban',
            'Marital Status_Divorced', 'Marital Status_Married', 'Marital Status_Single',
            'Gender_Female', 'Gender_Male'
        ]
        
        for col in ohe_columns:
            new_df[col] = np.float64(0)
        
        # Location Type - Case-insensitive comparison
        location_type = new_df["Location Type"].iloc[0].lower() if isinstance(new_df["Location Type"].iloc[0], str) else ""
        
        if "rural" in location_type:
            new_df["Location Type_Rural"] = np.float64(1)
        elif "suburban" in location_type:
            new_df["Location Type_Suburban"] = np.float64(1)
        elif "urban" in location_type:
            new_df["Location Type_Urban"] = np.float64(1)
        else:
            # Default to most common type if unknown
            new_df["Location Type_Urban"] = np.float64(1)
            print(f"Warning: Unknown Location Type: {new_df['Location Type'].iloc[0]}, defaulting to Urban")
            
        # Marital Status - Case-insensitive comparison
        marital_status = new_df["Marital Status"].iloc[0].lower() if isinstance(new_df["Marital Status"].iloc[0], str) else ""
        
        if "divorced" in marital_status or "separated" in marital_status:
            new_df["Marital Status_Divorced"] = np.float64(1)
        elif "married" in marital_status:
            new_df["Marital Status_Married"] = np.float64(1)
        elif "single" in marital_status:
            new_df["Marital Status_Single"] = np.float64(1)
        else:
            # Default to most common type if unknown
            new_df["Marital Status_Married"] = np.float64(1)
            print(f"Warning: Unknown Marital Status: {new_df['Marital Status'].iloc[0]}, defaulting to Married")
            
        # Gender - Case-insensitive comparison
        gender = new_df["Gender"].iloc[0].lower() if isinstance(new_df["Gender"].iloc[0], str) else ""
        
        if "female" in gender or "f" == gender:
            new_df["Gender_Female"] = np.float64(1)
        elif "male" in gender or "m" == gender:
            new_df["Gender_Male"] = np.float64(1)
        else:
            # Default to most common type if unknown
            new_df["Gender_Male"] = np.float64(1)
            print(f"Warning: Unknown Gender: {new_df['Gender'].iloc[0]}, defaulting to Male")
            
        # Drop the original categorical columns
        new_df = new_df.drop(columns=["Location Type", "Marital Status", "Gender"])
        
        # 3. Manual ordinal encoding for second group of categorical features
        # Education Level - Updated with exact values from your dataset
        edu_mapping = {
            "Up to O/L": 0,
            "A/L": 1,
            "Diploma/TVET": 2,
            "Bachelor": 3,
            "Postgraduate": 4,
            # For backward compatibility
            "Diploma": 2,
            "Bachelor's": 3,
            "Master's": 4,
            "PhD": 4
        }
        if "Education Level" in new_df.columns:
            new_df["Education Level"] = new_df["Education Level"].map(edu_mapping).fillna(0)
        
        # Occupation - Updated with exact values from your dataset
        occ_mapping = {
            "Salaried—Private": 0,
            "Salaried—Public": 1,
            "Self-Employed": 2,
            "Self-employed": 2,  # For backward compatibility
            "Small Business Owner": 3,
            "Business Owner": 3,  # For backward compatibility
            "Gig/Part-time": 4,
            "Professional": 4,  # For backward compatibility
            "Student": 5,
            "Unemployed": 6
        }
        if "Occupation" in new_df.columns:
            new_df["Occupation"] = new_df["Occupation"].map(occ_mapping).fillna(0)
            
        # Exercise Frequency
        ex_freq_mapping = {
            "No": 0,
            "None": 0,
            "Never": 0,
            "1-2/wk": 1,
            "1-2 times per week": 1,
            "3-5/wk": 2,
            "3-5 times per week": 2,
            "Daily": 3,
            "Every day": 3
        }
        if "Exercise Frequency" in new_df.columns:
            # Normalize the input value - Using proper pandas .loc to avoid ChainedAssignmentError
            if isinstance(new_df.loc[0, "Exercise Frequency"], str):
                ex_freq = new_df.loc[0, "Exercise Frequency"].lower()
                
                # Case-insensitive matching for common patterns
                if "never" in ex_freq or "no" in ex_freq or "none" in ex_freq:
                    normalized_value = "No"
                elif "1" in ex_freq or "2" in ex_freq or "twice" in ex_freq:
                    normalized_value = "1-2/wk"
                elif "3" in ex_freq or "4" in ex_freq or "5" in ex_freq:
                    normalized_value = "3-5/wk"
                elif "daily" in ex_freq or "every" in ex_freq or "day" in ex_freq:
                    normalized_value = "Daily"
                else:
                    normalized_value = ex_freq  # Keep original if no match
                
                # Use .loc for assignment to avoid warning
                new_df.loc[0, "Exercise Frequency"] = normalized_value
            
            # Apply mapping
            new_df["Exercise Frequency"] = new_df["Exercise Frequency"].map(ex_freq_mapping).fillna(0)
        
        # We don't remove Children anymore as it might be needed for design_columns
        
        # Debug: Print available columns after preprocessing
        print("Available columns after preprocessing:")
        print(sorted(new_df.columns.tolist()))
        
        # Ensure features are in the same order as used during training
        if design_columns is not None:
            print("Using design columns for feature alignment")
            print(f"Number of design columns: {len(design_columns)}")
            print(f"Design columns: {sorted(design_columns)}")
            
            # Create an empty DataFrame with zeros and proper columns
            final_features = pd.DataFrame(0, index=[0], columns=design_columns)
            
            # Fill in the values for columns that exist in our processed data
            matched_cols = []
            missing_cols = []
            for col in design_columns:
                if col in new_df.columns:
                    final_features[col] = new_df[col]
                    matched_cols.append(col)
                else:
                    missing_cols.append(col)
            
            print(f"Matched {len(matched_cols)} out of {len(design_columns)} columns")
            if missing_cols:
                print(f"Missing columns: {missing_cols}")
            
            
            # Use the properly ordered features for prediction
            # Force zero fill any remaining NaN values to ensure prediction works
            final_features = final_features.fillna(0)
            
        
            # Print data types for debugging
            print("Data types before prediction:")
            print(final_features.dtypes)
            
            # Print a sample of values to verify they're float64
            print("\nSample values:")
            specific_cols = ["Age", "Income (LKR Monthly)", "Health Index", "Car Ownership", 
                         "Location Type_Rural", "Location Type_Suburban", "Location Type_Urban",
                         "Marital Status_Divorced", "Marital Status_Married", "Marital Status_Single",
                         "Gender_Female", "Gender_Male"]
            
            for col in specific_cols:
                if col in final_features.columns:
                    value = final_features[col].iloc[0]
                    print(f"{col}: {value}, type: {type(value).__name__}")
            
            # Suppress UserWarning about feature names
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", UserWarning)
                
                # Convert DataFrame directly to float64 numpy array
                # This ensures column order is preserved exactly as in design_columns
                print(final_features)
                features_array = final_features.astype(np.float64).to_numpy()
                print(f"Features array shape: {features_array.shape}, dtype: {features_array.dtype}")

                # Double-check the array is contiguous and float64
                features_array = np.ascontiguousarray(features_array, dtype=np.float64)

                # Ensure kmeans internals are float64 and contiguous if possible
                try:
                    if hasattr(kmeans, 'cluster_centers_'):
                        kmeans.cluster_centers_ = np.ascontiguousarray(kmeans.cluster_centers_.astype(np.float64))
                        print(f"KMeans centers shape: {kmeans.cluster_centers_.shape}, dtype: {kmeans.cluster_centers_.dtype}")
                except Exception:
                    # Don't fail prediction just because we couldn't cast centers in-place
                    pass

                # Predict with data type safety
                cluster_id = int(kmeans.predict(features_array)[0])

        else:
            print("No design columns available, using current feature set")
            # Fallback if design_columns not available
            

            # Ensure all columns are converted using pd.to_numeric and then to float64
            for col in new_df.columns:
                new_df[col] = pd.to_numeric(new_df[col], errors="coerce").fillna(0).astype(np.float64)
                
            print("Data types before prediction (fallback):")
            print(new_df.dtypes)
            
            # Extra safety measures for dealing with dtype mismatches (fallback case)
            try:
                # Convert DataFrame directly to float64 numpy array
                features_array = new_df.astype(np.float64).to_numpy()
                print(f"Fallback features array shape: {features_array.shape}, dtype: {features_array.dtype}")

                # Ensure it's a contiguous C-ordered array as scikit-learn expects
                features_array = np.ascontiguousarray(features_array, dtype=np.float64)

                # Ensure kmeans internals are float64 and contiguous if possible
                try:
                    if hasattr(kmeans, 'cluster_centers_'):
                        kmeans.cluster_centers_ = np.ascontiguousarray(kmeans.cluster_centers_.astype(np.float64))
                except Exception:
                    pass

                # Predict with data type safety
                cluster_id = int(kmeans.predict(features_array)[0])
            except Exception as e:
                print(f"Error during fallback prediction: {str(e)}")
                # Try direct approach with centers
                if hasattr(kmeans, 'cluster_centers_'):
                    # Create array directly from the dataframe again
                    features_vec = np.ascontiguousarray(new_df.astype(np.float64).to_numpy(), dtype=np.float64)
                    # Calculate distances manually (ensure centers are float64)
                    try:
                        centers = np.ascontiguousarray(kmeans.cluster_centers_.astype(np.float64))
                        distances = np.sqrt(((centers - features_vec) ** 2).sum(axis=1))
                        cluster_id = int(np.argmin(distances))
                    except Exception as e2:
                        print(f"Error during manual distance fallback: {str(e2)}")
        
        return {"cluster_id": cluster_id}
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}\n{error_details}")

@router.post("/debug-predict-cluster")
async def debug_predict_cluster(data: ClusterPredictionInput):
    """
    Debug endpoint to predict cluster ID with additional information about the preprocessing
    """
    try:
        # Regular prediction
        result = await predict_cluster(data)
        cluster_id = result["cluster_id"]
        
        # Load bundle to get cluster descriptions
        bundle = get_bundle()
        kmeans = bundle.get("kmeans")
        
        # Get cluster centers if available
        cluster_centers = None
        if hasattr(kmeans, 'cluster_centers_'):
            cluster_centers = kmeans.cluster_centers_.tolist()
        
        # Cluster descriptions
        cluster_descriptions = {
            0: "Budget-conscious consumers who rarely splurge",
            1: "High-income professionals with premium spending habits",
            2: "Middle-class families with balanced spending",
            3: "Young urban professionals with trendy spending habits",
            4: "Value-oriented consumers with selective luxury spending"
        }
        
        # Get the description for this cluster
        cluster_description = cluster_descriptions.get(cluster_id, "Unknown cluster type")
        
        # Load bundle again for debugging
        bundle = get_bundle()
        design_columns = bundle.get("design_columns")
        
        # Create a test dataframe like the prediction one
        debug_df = pd.DataFrame([{
            "Gender": data.gender,
            "Age": data.age,
            "Income (LKR Monthly)": data.income,
            "Education Level": data.education_level,
            "Occupation": data.occupation,
            "Marital Status": data.marital_status,
            "Children": data.num_children,
            "Location Type": data.location_type,
            "Exercise Frequency": data.exercise_frequency,
            "Car Ownership": data.car_ownership
        }])
        
        # Check for missing columns
        missing_columns = []
        if design_columns:
            # Convert both lists to sets and find the difference
            available_columns = set(debug_df.columns)
            required_columns = set(design_columns)
            missing_raw_columns = required_columns.difference(available_columns)
            
            # Now check for encoded columns
            # These are columns like 'Gender_Female' that are created during preprocessing
            for col in design_columns:
                if '_' in col:  # This is likely an encoded categorical column
                    prefix = col.split('_')[0]
                    if prefix in available_columns:
                        # We have the raw column that will be encoded
                        pass
                    else:
                        # This might be a derived column not directly in our input
                        missing_columns.append(col)
        
        # Return enhanced information
        return {
            "cluster_id": cluster_id,
            "cluster_description": cluster_description,
            "user_data": {
                "gender": data.gender,
                "age": data.age,
                "income": data.income,
                "education_level": data.education_level,
                "occupation": data.occupation,
                "marital_status": data.marital_status,
                "location_type": data.location_type,
                "exercise_frequency": data.exercise_frequency,
                "num_children": data.num_children,
                "car_ownership": data.car_ownership,
            },
            "model_info": {
                "design_columns_sample": sorted(design_columns[:15]) if design_columns else None,
                "design_columns_count": len(design_columns) if design_columns else 0,
                "missing_columns": missing_columns if missing_columns else "None"
            }
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Debug prediction error: {str(e)}\n{error_details}")