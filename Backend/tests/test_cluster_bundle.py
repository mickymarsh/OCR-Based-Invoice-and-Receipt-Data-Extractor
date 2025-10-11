# import os
# import joblib
# import pandas as pd
# import numpy as np

# # Path to joblib bundle file
# MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
# CLUSTER_PIPELINE_PATH = os.path.join(MODEL_DIR, "cluster_pipeline.joblib")

# def get_bundle():
#     try:
#         # Check if cluster pipeline exists
#         if not os.path.exists(CLUSTER_PIPELINE_PATH):
#             raise FileNotFoundError(f"Cluster pipeline file not found at {CLUSTER_PIPELINE_PATH}")
            
#         # Load cluster pipeline bundle
#         bundle = joblib.load(CLUSTER_PIPELINE_PATH)
#         print("Successfully loaded bundle with keys:", list(bundle.keys()))
#         return bundle
#     except Exception as e:
#         raise RuntimeError(f"Error loading cluster pipeline: {str(e)}")

# def test_prediction():
#     # Sample user data matching the structure in ClusterPredictionInput
#     user_data = {
#         "gender": "Male",
#         "age": 35,
#         "income": 75000,  # Monthly income in LKR
#         "education_level": "Bachelor's Degree",
#         "occupation": "Professional",
#         "marital_status": "Married",
#         "num_children": 2,
#         "location_type": "Urban",
#         "exercise_frequency": "3-5/wk",
#         "car_ownership": "Yes"
#     }
    
#     try:
#         # Load bundle
#         bundle = get_bundle()
        
#         # Extract components from the bundle
#         kmeans = bundle.get("kmeans")
#         scaler = bundle.get("scaler")
#         onehot_encoder = bundle.get("onehot_encoder")
#         ordinal_encoder = bundle.get("ordinal_encoder")
#         num_cols = bundle.get("num_cols")
#         cat_cols_1 = bundle.get("cat_cols_1")
#         cat_cols_2 = bundle.get("cat_cols_2")
#         design_columns = bundle.get("design_columns")
        
#         print(f"Components loaded:")
#         print(f"- KMeans: {type(kmeans)}")
#         print(f"- Scaler: {type(scaler)}")
#         print(f"- OneHot Encoder: {type(onehot_encoder)}")
#         print(f"- Ordinal Encoder: {type(ordinal_encoder)}")
#         print(f"- Numerical columns: {num_cols}")
#         print(f"- Categorical columns 1: {cat_cols_1}")
#         print(f"- Categorical columns 2: {cat_cols_2}")
#         print(f"- Design columns length: {len(design_columns) if design_columns is not None else 'N/A'}")
        
#         # Create dataframe from input data
#         new_df = pd.DataFrame([{
#             "Gender": user_data["gender"],
#             "Age": user_data["age"],
#             "Income (LKR Monthly)": user_data["income"],
#             "Education Level": user_data["education_level"],
#             "Occupation": user_data["occupation"],
#             "Marital Status": user_data["marital_status"],
#             "Children": user_data["num_children"],
#             "Location Type": user_data["location_type"],
#             "Exercise Frequency": user_data["exercise_frequency"],
#             "Car Ownership": 1 if user_data["car_ownership"].lower() == 'yes' else 0
#         }])
        
#         # Add Health Index
#         # 1) Make sure Exercise Frequency has no nulls and unify labels
#         freq = (
#             new_df["Exercise Frequency"]
#             .astype(str)
#             .str.strip()
#             .replace({" No ": "No"})
#         )

#         # 2) Map exercise → bonus
#         ex_map = {"No": 0, "None": 0, "1-2/wk": 5, "3-5/wk": 10, "Daily": 15}
#         ex_bonus = freq.map(ex_map).fillna(0).to_numpy(dtype=float)

#         # 3) Age penalty (only if Age > 42)
#         age = new_df["Age"].to_numpy(dtype=float)
#         age_penalty = np.clip((age - 40), 0, None)

#         # 4) New Health Index, clipped to [0,100]
#         health = 65 - age_penalty + ex_bonus
#         new_df["Health Index"] = np.clip(health, 0, 100)
        
#         print("\nOriginal DataFrame:")
#         print(new_df)
        
#         # Apply preprocessing steps in the same order as training
#         # 1. Scale numerical features
#         if scaler and num_cols:
#             new_df[num_cols] = scaler.transform(new_df[num_cols])
        
#         # 2. One-hot encode first group of categorical features
#         if onehot_encoder and cat_cols_1:
#             ohe_features = onehot_encoder.transform(new_df[cat_cols_1])
            
#             # Create DataFrame with one-hot encoded features
#             ohe_df = pd.DataFrame(
#                 ohe_features,
#                 columns=onehot_encoder.get_feature_names_out(cat_cols_1),
#                 index=new_df.index
#             )
            
#             # Combine with original data
#             new_df = pd.concat([new_df.drop(columns=cat_cols_1), ohe_df], axis=1)
        
#         # 3. Ordinal encode second group of categorical features
#         if ordinal_encoder and cat_cols_2:
#             new_df[cat_cols_2] = ordinal_encoder.transform(new_df[cat_cols_2])
        
#         # Remove columns not used for clustering
#         if 'Children' in new_df.columns:
#             new_df = new_df.drop(columns=['Children'])
        
#         print("\nPreprocessed DataFrame (before feature ordering):")
#         print(new_df.shape)
        
#         # Ensure features are in the same order as used during training
#         if design_columns is not None:
#             # Create an empty DataFrame with zeros and proper columns
#             final_features = pd.DataFrame(0, index=[0], columns=design_columns)
            
#             # Fill in the values for columns that exist in our processed data
#             for col in new_df.columns:
#                 if col in design_columns:
#                     final_features[col] = new_df[col]
            
#             # Use the properly ordered features for prediction
#             print("\nFinal features shape:", final_features.shape)
#             print("Design columns shape:", len(design_columns))
            
#             # Predict cluster
#             cluster_id = int(kmeans.predict(final_features)[0])
#         else:
#             # Fallback if design_columns not available
#             cluster_id = int(kmeans.predict(new_df)[0])
        
#         print(f"\nPredicted Cluster ID: {cluster_id}")
        
#     except Exception as e:
#         import traceback
#         print(f"Error: {str(e)}")
#         print(traceback.format_exc())

# if __name__ == "__main__":
#     test_prediction()