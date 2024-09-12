from fastapi import FastAPI
from celery import Celery

app = FastAPI()

celery = Celery(
    __name__,
    broker='redis://:your_secure_password@redis:6379/0',
    backend='redis://:your_secure_password@redis:6379/0'
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/tasks/")
def run_task():
    task = add_task.delay(2, 2)
    return {"task_id": task.id}

@celery.task
def add_task(x, y):
    return x + y
