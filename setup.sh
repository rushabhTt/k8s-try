#!/bin/bash

# Create project directory
mkdir -p k8s-fastapi-project
cd k8s-fastapi-project

# Create directories
mkdir -p app k8s

# Create main.py
cat << EOF > app/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
EOF

# Create requirements.txt
echo "fastapi==0.68.0
uvicorn==0.15.0" > requirements.txt

# Create Dockerfile
cat << EOF > Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Create kubernetes deployment file
cat << EOF > k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fastapi-app
  template:
    metadata:
      labels:
        app: fastapi-app
    spec:
      containers:
      - name: fastapi-app
        image: your-docker-registry/fastapi-app:latest
        ports:
        - containerPort: 8000
EOF

# Create kubernetes service file
cat << EOF > k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: fastapi-app-service
spec:
  selector:
    app: fastapi-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
EOF

echo "Project structure created successfully!"