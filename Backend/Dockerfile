# Step 1: Use an official Python image
FROM python:3.12

# Step 2: Set a working directory inside the container
WORKDIR /app

# Step 3: Copy all project files into the container
COPY . /app

# Step 4: Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Expose the port FastAPI runs on
EXPOSE 8080

# Step 6: Command to run the FastAPI app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
