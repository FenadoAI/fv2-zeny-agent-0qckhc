from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import jwt
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'zeny_ai')]

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Gemini API Configuration
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyA5DClgaFghusD3zcpsb_tQUyBCpzskfg0')
DEFAULT_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-pro')

# Available Gemini models
AVAILABLE_MODELS = {
    'gemini-2.5-pro': {
        'name': 'Gemini 2.5 Pro',
        'description': 'Most capable model with advanced reasoning',
        'rate_limit': '2 requests/minute (free tier)'
    },
    'gemini-2.5-flash': {
        'name': 'Gemini 2.5 Flash',
        'description': 'Fast and efficient for most tasks',
        'rate_limit': '15 requests/minute (free tier)'
    }
}

# Global model cache
model_cache = {}

if GEMINI_AVAILABLE:
    genai.configure(api_key=GEMINI_API_KEY)
    # Initialize default model
    model_cache[DEFAULT_MODEL] = genai.GenerativeModel(DEFAULT_MODEL)

def get_model(model_name: str = DEFAULT_MODEL):
    """Get or create a Gemini model instance"""
    if not GEMINI_AVAILABLE:
        return None
    
    if model_name not in model_cache:
        if model_name in AVAILABLE_MODELS:
            model_cache[model_name] = genai.GenerativeModel(model_name)
        else:
            # Fallback to default model
            model_name = DEFAULT_MODEL
            if model_name not in model_cache:
                model_cache[model_name] = genai.GenerativeModel(model_name)
    
    return model_cache[model_name]

# Create the main app without a prefix
app = FastAPI(title="Zeny AI", description="AI Avatar Communication System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Admin Models
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Avatar Models
class Avatar(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    personality: str
    instructions: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AvatarCreate(BaseModel):
    name: str
    description: str
    personality: str
    instructions: str

class AvatarUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    personality: Optional[str] = None
    instructions: Optional[str] = None

# Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    avatar_id: str
    user_message: str
    avatar_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatInput(BaseModel):
    avatar_id: str
    message: str
    model: Optional[str] = DEFAULT_MODEL

class ChatResponse(BaseModel):
    response: str
    avatar_name: str
    model_used: str

class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    rate_limit: str

class ModelsResponse(BaseModel):
    available_models: List[ModelInfo]
    default_model: str

# Authentication functions
def verify_admin_credentials(username: str, password: str) -> bool:
    return username == "admin" and password == "admin"

def create_access_token(data: dict):
    return jwt.encode(data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# AI response function using Gemini
async def generate_ai_response(avatar: dict, user_message: str, model_name: str = DEFAULT_MODEL) -> str:
    if GEMINI_AVAILABLE:
        try:
            selected_model = get_model(model_name)
            if selected_model:
                # Create a personalized prompt for the avatar
                system_prompt = f"""You are {avatar['name']}, an AI avatar with the following characteristics:

Description: {avatar['description']}
Personality: {avatar['personality']}
Instructions: {avatar['instructions']}

You should respond in character as {avatar['name']} with the specified personality. Be natural, engaging, and follow your instructions. Keep responses conversational and appropriately sized for a chat interface (1-3 paragraphs maximum).

User message: {user_message}

Respond as {avatar['name']}:"""

                response = selected_model.generate_content(system_prompt)
                return response.text.strip()
        except Exception as e:
            # Fallback to simulated response if Gemini fails
            logger.error(f"Gemini API error: {e}")
            return f"Hi! I'm {avatar['name']}. {avatar['personality']} You said: '{user_message}'. I'm experiencing some technical difficulties, but I'm here to help! Can you tell me more about what you'd like to know?"
    
    # Fallback simulated response when Gemini is not available
    return f"Hi! I'm {avatar['name']}. {avatar['personality']} You said: '{user_message}'. Here's my response based on my instructions: {avatar['instructions'][:100]}..."

# Routes
@api_router.get("/")
async def root():
    return {
        "message": "Welcome to Zeny AI - AI Avatar Communication System",
        "gemini_available": GEMINI_AVAILABLE,
        "default_model": DEFAULT_MODEL,
        "available_models": len(AVAILABLE_MODELS)
    }

# Models endpoint
@api_router.get("/models", response_model=ModelsResponse)
async def get_available_models():
    """Get available Gemini models"""
    models = [
        ModelInfo(
            id=model_id,
            name=model_info['name'],
            description=model_info['description'],
            rate_limit=model_info['rate_limit']
        )
        for model_id, model_info in AVAILABLE_MODELS.items()
    ]
    
    return ModelsResponse(
        available_models=models,
        default_model=DEFAULT_MODEL
    )

# Admin Authentication Routes
@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    if not verify_admin_credentials(credentials.username, credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": credentials.username})
    return AdminToken(access_token=access_token)

# Avatar Management Routes (Admin only)
@api_router.post("/admin/avatars", response_model=Avatar)
async def create_avatar(avatar_data: AvatarCreate, admin: str = Depends(verify_token)):
    avatar = Avatar(**avatar_data.dict())
    await db.avatars.insert_one(avatar.dict())
    return avatar

@api_router.get("/admin/avatars", response_model=List[Avatar])
async def get_avatars_admin(admin: str = Depends(verify_token)):
    avatars = await db.avatars.find().to_list(1000)
    return [Avatar(**avatar) for avatar in avatars]

@api_router.put("/admin/avatars/{avatar_id}", response_model=Avatar)
async def update_avatar(avatar_id: str, avatar_data: AvatarUpdate, admin: str = Depends(verify_token)):
    existing_avatar = await db.avatars.find_one({"id": avatar_id})
    if not existing_avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    update_data = {k: v for k, v in avatar_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.avatars.update_one({"id": avatar_id}, {"$set": update_data})
    updated_avatar = await db.avatars.find_one({"id": avatar_id})
    return Avatar(**updated_avatar)

@api_router.delete("/admin/avatars/{avatar_id}")
async def delete_avatar(avatar_id: str, admin: str = Depends(verify_token)):
    result = await db.avatars.delete_one({"id": avatar_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return {"message": "Avatar deleted successfully"}

# Public Avatar Routes (No authentication required)
@api_router.get("/avatars", response_model=List[Avatar])
async def get_public_avatars():
    avatars = await db.avatars.find().to_list(1000)
    return [Avatar(**avatar) for avatar in avatars]

@api_router.get("/avatars/{avatar_id}", response_model=Avatar)
async def get_avatar(avatar_id: str):
    avatar = await db.avatars.find_one({"id": avatar_id})
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return Avatar(**avatar)

# Chat Routes (No authentication required)
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_avatar(chat_input: ChatInput):
    avatar = await db.avatars.find_one({"id": chat_input.avatar_id})
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    # Use selected model or default
    selected_model = chat_input.model or DEFAULT_MODEL
    if selected_model not in AVAILABLE_MODELS:
        selected_model = DEFAULT_MODEL
    
    ai_response = await generate_ai_response(avatar, chat_input.message, selected_model)
    
    # Save chat history
    chat_message = ChatMessage(
        avatar_id=chat_input.avatar_id,
        user_message=chat_input.message,
        avatar_response=ai_response
    )
    await db.chat_history.insert_one(chat_message.dict())
    
    return ChatResponse(
        response=ai_response, 
        avatar_name=avatar["name"],
        model_used=selected_model
    )

@api_router.get("/admin/chat-history", response_model=List[ChatMessage])
async def get_chat_history(admin: str = Depends(verify_token)):
    chat_history = await db.chat_history.find().sort("timestamp", -1).to_list(1000)
    return [ChatMessage(**chat) for chat in chat_history]

# Legacy status routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
