import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class DataBase:
    client: AsyncIOMotorClient = None
    db = None

db = DataBase()

async def connect_to_mongo():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "research_intelligence_db")
    
    db.client = AsyncIOMotorClient(mongo_uri)
    db.db = db.client[database_name]
    print(f"Connected to MongoDB: {database_name}")

async def close_mongo_connection():
    if db.client is not None:
        db.client.close()
        print("MongoDB connection closed")

def get_database():
    return db.db
