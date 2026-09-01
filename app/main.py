from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import CORS_ORIGINS
from app.core.dependencies import get_current_user
from app.database import engine, Base, get_db
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.tasks import router as tasks_router


app = FastAPI(
    title="Task Management API",
    description="A Task Management REST API built with FastAPI and PostgreSQL",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Include routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(tasks_router)


@app.get("/")
def home():
    return {
        "message": "Task Management API is running!"
    }


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected"
    }


@app.get("/db-test")
def database_test(
    db: Session = Depends(get_db)
):
    db.execute(text("SELECT 1"))

    return {
        "database": "connected"
    }


@app.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }
