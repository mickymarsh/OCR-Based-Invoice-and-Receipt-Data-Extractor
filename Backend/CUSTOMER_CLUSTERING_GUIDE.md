# Customer Clustering User Guide

This document explains how to use the customer clustering functionality in your application.

## Overview

The customer clustering feature uses machine learning to segment users into different customer groups based on their demographic and behavioral information. This segmentation can be used for:

1. Personalized recommendations
2. Targeted marketing
3. Customized user experience
4. Business intelligence and analytics

## Setup Instructions

Before using the customer clustering functionality, ensure that:

1. Required dependencies are installed:
   ```bash
   pip install scikit-learn==1.4.0 pandas==2.2.0 numpy==1.26.3 joblib==1.3.2
   ```

2. The clustering model bundle is available:
   ```bash
   cd Backend
   python generate_models.py  # If you need to generate a new model bundle
   ```
   This will create a single model bundle file in the `Backend/models` directory:
   - `cluster_pipeline.joblib` - A comprehensive bundle containing:
     - KMeans clustering model
     - MinMaxScaler for numerical features
     - OneHotEncoder for categorical features (Location Type, Marital Status, Gender)
     - OrdinalEncoder for categorical features (Education Level, Occupation, Exercise Frequency)
     - Feature column names and order for consistent preprocessing

## Using the API Endpoint

### API Details

- **URL**: `/user/predict-cluster`
- **Method**: POST
- **Authentication**: Required (Firebase token)
- **Content-Type**: application/json

### Request Format

```json
{
  "gender": "Female",
  "age": 32,
  "income": 61733,
  "education_level": "Up to O/L",
  "occupation": "Salaried—Public",
  "marital_status": "Divorced",
  "num_children": 0,
  "location_type": "Urban",
  "exercise_frequency": "3-5/wk",
  "car_ownership": "Yes"
}
```

### Response Format

```json
{
  "cluster_id": 2
}
```

### Field Descriptions

| Field              | Type   | Description                                                      |
|--------------------|--------|------------------------------------------------------------------|
| gender             | string | User's gender ("Male" or "Female")                               |
| age                | int    | User's age in years                                              |
| income             | int    | Monthly income in LKR                                            |
| education_level    | string | Education level (e.g., "Up to O/L", "Bachelor's", "PhD")         |
| occupation         | string | Occupation category                                              |
| marital_status     | string | Marital status (e.g., "Single", "Married", "Divorced")           |
| num_children       | int    | Number of children                                               |
| location_type      | string | Location type ("Urban", "Suburban", "Rural")                     |
| exercise_frequency | string | Exercise frequency ("Never", "1-2/wk", "3-5/wk", "Daily")        |
| car_ownership      | string | Whether the user owns a car ("Yes" or "No")                      |

## Cluster Interpretations

The model segments users into 5 clusters with the following interpretations:

Below are expanded, human-readable summaries for clusters (strengths = features that most strongly characterize the cluster; weaknesses = features that are weaker or less typical for the cluster). These summaries include approximate cluster sizes (n) and ordered feature importance directionality for quick interpretation.

- **Cluster 0 (n=3562):**
  ↑ strongest: Car Ownership, Income (LKR Monthly), Health Index, Exercise Frequency, Occupation
  ↓ weakest : Number of Children, Age, Education Level, Marital Status_Married, Gender_Male

- **Cluster 1 (n=5733):**
  ↑ strongest: Marital Status_Divorced, Location Type_Rural, Marital Status_Single, Car Ownership, Income (LKR Monthly)
  ↓ weakest : Occupation, Exercise Frequency, Number of Children, Education Level, Health Index

- **Cluster 2 (n=8895):**
  ↑ strongest: Marital Status_Divorced, Exercise Frequency, Health Index, Marital Status_Single, Education Level
  ↓ weakest : Occupation, Number of Children, Age, Marital Status_Married, Income (LKR Monthly)

- **Cluster 3 (n=2822):**
  ↑ strongest: Gender_Female, Marital Status_Married, Age, Education Level, Number of Children
  ↓ weakest : Marital Status_Single, Health Index, Occupation, Exercise Frequency, Marital Status_Divorced

- **Cluster 4 (n=8689):**
  ↑ strongest: Marital Status_Divorced, Location Type_Urban, Marital Status_Single, Exercise Frequency, Health Index
  ↓ weakest : Education Level, Occupation, Number of Children, Age, Marital Status_Married

- **Cluster 5 (n=7368):**
  ↑ strongest: Location Type_Rural, Marital Status_Divorced, Marital Status_Single, Income (LKR Monthly), Occupation
  ↓ weakest : Education Level, Number of Children, Exercise Frequency, Age, Marital Status_Married

- **Cluster 6 (n=2804):**
  ↑ strongest: Health Index, Gender_Female, Location Type_Rural, Marital Status_Single, Occupation
  ↓ weakest : Income (LKR Monthly), Education Level, Car Ownership, Number of Children, Age

- **Cluster 7 (n=3142):**
  ↑ strongest: Gender_Male, Income (LKR Monthly), Marital Status_Married, Age, Number of Children
  ↓ weakest : Education Level, Marital Status_Single, Health Index, Occupation, Marital Status_Divorced

- **Cluster 8 (n=6985):**
  ↑ strongest: Marital Status_Divorced, Health Index, Marital Status_Single, Occupation, Education Level
  ↓ weakest : Income (LKR Monthly), Number of Children, Age, Marital Status_Married, Car Ownership

Note: If your production model currently uses only 5 clusters (0–4) then clusters 5–8 reflect an alternative or extended segmentation; ensure the `cluster_pipeline.joblib` used in your environment matches the cluster count described here.

## Example Code

### Python Example

```python
import requests
import json

# API endpoint URL
api_url = "http://localhost:8000/user/predict-cluster"

# User data
user_data = {
    "gender": "Female",
    "age": 32,
    "income": 61733,
    "education_level": "Up to O/L",
    "occupation": "Salaried—Public",
    "marital_status": "Divorced",
    "num_children": 0,
    "location_type": "Urban",
    "exercise_frequency": "3-5/wk",
    "car_ownership": "Yes"
}

# Firebase authentication token (obtain from your authentication system)
firebase_token = "your_firebase_auth_token"

# Make the request
response = requests.post(
    api_url,
    headers={"Authorization": f"Bearer {firebase_token}"},
    json=user_data
)

# Parse and use the response
if response.status_code == 200:
    result = response.json()
    cluster_id = result["cluster_id"]
    print(f"User belongs to cluster {cluster_id}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
```

## Troubleshooting

If you encounter issues with the customer clustering functionality:

1. Ensure the required packages are installed
2. Verify that the `cluster_pipeline.joblib` file exists in the `Backend/models` directory
3. Check that the API server is running
4. Validate that the authentication token is valid
5. Make sure the user data format matches the expected input format
6. Verify that the bundle structure has all required components (kmeans, scaler, onehot_encoder, ordinal_encoder, num_cols, cat_cols_1, cat_cols_2, design_columns)

For any additional issues, check the application logs for error messages.