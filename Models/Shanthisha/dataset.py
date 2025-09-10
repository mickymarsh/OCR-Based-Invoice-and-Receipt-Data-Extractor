import numpy as np
import pandas as pd


# Config

N = 50_000
rng = np.random.default_rng(42)

# --- Helper categorical distributions ---
def sample_with_probs(choices, probs, n):
    return rng.choice(choices, size=n, p=probs)

# Generate columns


# Age: 18–65, skewed towards 20–40
age = np.clip(rng.normal(loc=35, scale=10, size=N).astype(int), 18, 65)

# Gender
gender = rng.choice(["Male", "Female"], size=N)

# Income (LKR monthly, 2024 realistic)
income = []
for a in age:
    if a < 22:
        income.append(rng.integers(25_000, 60_000))  # students / entry-level
    elif a < 30:
        income.append(rng.integers(40_000, 120_000))
    elif a < 40:
        income.append(rng.integers(60_000, 200_000))
    elif a < 50:
        income.append(rng.integers(50_000, 180_000))
    else:
        income.append(rng.integers(30_000, 120_000))
income = np.array(income)

# Education Level (probs reflect educated app users)
edu_levels = ["Up to O/L", "A/L", "Diploma/TVET", "Bachelor", "Postgraduate"]
edu_probs  = [0.30, 0.35, 0.15, 0.15, 0.05]
education = sample_with_probs(edu_levels, edu_probs, N)

# Occupation
occ_levels = [
    "Salaried—Private", "Self-Employed", "Salaried—Public",
    "Student", "Gig/Part-time", "Small Business Owner", "Unemployed"
]
occ_probs  = [0.40, 0.25, 0.12, 0.05, 0.05, 0.05, 0.08]
occupation = sample_with_probs(occ_levels, occ_probs, N)

# Marital Status
marital_levels = ["Single", "Married", "Divorced"]
marital_probs  = [0.35, 0.60, 0.05]
marital = sample_with_probs(marital_levels, marital_probs, N)

# Number of Children (linked to marital status + age)
children = []
for m, a in zip(marital, age):
    if m == "Single" and a < 30:
        children.append(0)
    elif m == "Single":
        children.append(rng.choice([0,1]))
    elif m == "Married":
        if a < 30: children.append(rng.choice([0,1], p=[0.7,0.3]))
        elif a < 40: children.append(rng.choice([1,2,3], p=[0.5,0.4,0.1]))
        else: children.append(rng.choice([1,2,3,4], p=[0.3,0.4,0.2,0.1]))
    else:  # divorced
        children.append(rng.choice([0,1,2], p=[0.5,0.3,0.2]))
children = np.array(children)

# Location Type
loc_levels = ["Rural", "Urban", "Suburban"]
loc_probs  = [0.65, 0.20, 0.15]
location = sample_with_probs(loc_levels, loc_probs, N)

# Exercise Frequency
ex_freq_levels = [" No ", "1-2/wk", "3-5/wk", "Daily"]
ex_freq_probs  = [0.33, 0.32, 0.24, 0.11]
exercise = sample_with_probs(ex_freq_levels, ex_freq_probs, N)

# Health Index (no diet adjustment)
health_index = []
for a, ex in zip(age, exercise):
    base = 65
    age_penalty = max(0, (a - 42) / 2.2)
    exercise_bonus = {" No ": 0, "1-2/wk": 5, "3-5/wk": 10, "Daily": 15}[ex]
    val = base - age_penalty + exercise_bonus
    health_index.append(np.clip(val, 0, 100))
health_index = np.round(health_index, 2)

# Car Ownership (prob grows with income)
car_ownership = (income > 120_000).astype(int)
car_ownership = np.where((income > 70_000) & (rng.random(N) < 0.15), 1, car_ownership)

# Credit Score (simple rule-based, int 300–850)
credit_score = []
for inc, hi in zip(income, health_index):
    base = 400 + (inc // 1000) * 0.8
    health_adj = hi * 2
    noise = rng.normal(0, 30)
    score = np.clip(base + health_adj + noise, 300, 850)
    credit_score.append(int(score))
credit_score = np.array(credit_score)

# Build DataFrame
df = pd.DataFrame({
    "Name": [f"User{i}" for i in range(N)],
    "Gender": gender,
    "Age": age,
    "Income (LKR Monthly)": income,
    "Education Level": education,
    "Occupation": occupation,
    "Marital Status": marital,
    "Number of Children": children,
    "Location Type": location,
    "Health Index": health_index,
    "Exercise Frequency": exercise,
    "Credit Score": credit_score,
    "Car Ownership": car_ownership
})

print(df.head())
print(df.shape)
