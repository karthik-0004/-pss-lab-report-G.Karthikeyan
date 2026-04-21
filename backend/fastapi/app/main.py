import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from .database import Base, engine
from .routers import patients, reports

load_dotenv()

app_name = os.getenv("APP_NAME", "PSS Lab Report API")
app_version = os.getenv("APP_VERSION", "1.0.0")
uploads_dir = os.getenv("UPLOADS_DIR", "uploads")
allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",") if origin.strip()]

app = FastAPI(title=app_name, version=app_version)

os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    os.makedirs(uploads_dir, exist_ok=True)
    Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "PSS Lab API is running"}


app.include_router(patients.router)
app.include_router(reports.router)
