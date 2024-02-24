from datetime import datetime, timedelta, timezone
import json
from typing import Annotated
from fastapi import Depends, FastAPI, Request, HTTPException, Response, UploadFile, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from BaseModel.Video import VideoMinimumDuration, VideoStartBefore, VideoCheckPoints
from BaseModel.WaitList import WaitList as Waiter
from BaseModel.CreateUsers import CreateUser
from Editor import Editor
import core.Models as Models
from core.database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
import re
from services.services import Services
from threading import Timer


limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

Models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    
)

def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

services = Services(db = Depends(get_db))     
#editor = Editor("assets/video.mp4", "assets/video.mp4")

@app.post("/traitement-minimum")
async def traitement_video(video_data: str,video_upload: UploadFile, gameplay_upload: UploadFile):
    video = json.loads(video_data)

    #Validate against Pydantic model
    video_minimum_duration = VideoMinimumDuration(divide_each_minutes=video.get("divide_each_minutes"))
    save_video = await services.save_file(video_upload)
    save_gameplay = await services.save_file(gameplay_upload)

    editor = Editor(save_video,save_gameplay)
    editor.traitementVideo()
    
    result = await editor.divideEachXMinutes(video_minimum_duration.divide_each_minutes)
    Timer(3, editor.clearAll).start()
    return result

        
@app.post("/traitement-before")
async def traitement_video(video: VideoStartBefore, video_upload: UploadFile, gameplay_upload: UploadFile):
    save_video = await services.save_file(video_upload)
    save_gameplay = await services.save_file(gameplay_upload)
    editor = Editor(save_video, save_gameplay)
    editor.traitementVideo()
    editor.startNextVideoBeforeXSeconds(video.divide_each_minutes, video.start_before)

@app.post("/traitement-checkpoints")
async def traitement_video(video: VideoCheckPoints, video_upload: UploadFile, gameplay_upload: UploadFile):
    save_video = await services.save_file(video_upload)
    save_gameplay = await services.save_file(gameplay_upload)
    editor = Editor(save_video, save_gameplay)
    editor.traitementVideo()
    editor.divideWithCheckPoints(video.checkpoints)

       
@app.post("/subscribe")
@limiter.limit("30/minute")
def subscribe_list(request: Request, email: Waiter, db: Session = Depends(get_db)):
    regex = r'^[a-z0-9._%+-]+@[a-z.-]+\.[a-zA-Z]{2,}$'
    if re.match(regex, email.email):
        if db.query(Models.WaitList).filter(Models.WaitList.email == email.email).first() is None:
            wait_model = Models.WaitList()
            wait_model.email = email.email
            db.add(wait_model)
            db.commit()

            return email            
        else:
            raise HTTPException(status_code=409, detail="Email already subscribed.")


    else:
        raise HTTPException(status_code=400, detail="Please enter a valid email")

@app.get("/delete_all")
def deleteAll(db: Session = Depends(get_db)):
    db.query(Models.WaitList).delete()
    db.commit()

    return "All emails deleted"

@app.get("/")
def home():
    return "ok"

@app.post("/signup")
def create_user(data: CreateUser, db: Session = Depends(get_db)):
    services.create_new_user(data, db)
    payload = {"message": "User account has been succesfully created"}
    return JSONResponse(content=payload)

@app.post("/token")
async def login_for_access_token(
     form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, db: Session = Depends(get_db)
):
    user = services.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=services.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = services.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    response.set_cookie(key="access_token",value=f"Bearer {access_token}", httponly=True, samesite="lax", expires=datetime.now(timezone.utc) + access_token_expires)

    return {"message": "Come to the dark side, we have cookies"}

@app.get("/check-cookie")
async def check_cookie(request: Request):
    try:
        print(request.cookies)
        # Obtenez le cookie d'accès de la requête
        access_token_cookie = request.cookies.get("access_token", "")

        # Vérifiez si le cookie est présent
        if not access_token_cookie:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cookie d'accès manquant",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except HTTPException as e:
        raise e  # Transmettez les exceptions HTTP directement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cookie d'accès invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
@app.get("/logout")
def logout(response : Response, request : Request):
  response.set_cookie(key = "access_token", value="")
