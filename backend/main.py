import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config.database import connect_to_mongo, close_mongo_connection, db
from routes import auth_routes, project_routes, analysis_routes
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AI-Powered Research Intelligence Platform",
    description="Backend API for research analysis and intelligence platform.",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://airip-frontend.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include Routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(project_routes.router, prefix="/api/projects", tags=["Projects"])
app.include_router(analysis_routes.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to AI-Powered Research Intelligence Platform API"
    }
@app.get("/health")
async def health_check():
    try:
        if db.client is None or db.db is None:
            await connect_to_mongo()

        await db.client.admin.command("ping")

        return {
            "status": "ok",
            "database": "connected",
            "database_name": db.db.name,
            "mongodb_uri_configured": bool(os.getenv("MONGODB_URI"))
        }

    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "mongodb_uri_configured": bool(os.getenv("MONGODB_URI")),
            "error_type": type(e).__name__
        }
@app.get("/health")
async def health_check():
    try:
        if db.client is None or db.db is None:
            await connect_to_mongo()

        await db.client.admin.command("ping")

        return {
            "status": "ok",
            "database": "connected",
            "database_name": db.db.name,
            "mongodb_uri_configured": bool(os.getenv("MONGODB_URI"))
        }

    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "database": "disconnected",
                "mongodb_uri_configured": bool(os.getenv("MONGODB_URI")),
                "error_type": type(e).__name__
            }
        )