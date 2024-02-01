from fastapi import Depends, FastAPI, Request
from BaseModel.Video import Video
from BaseModel.WaitList import WaitList as Waiter
from Editor import Editor
from Models import WaitList
import Models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
)

def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
        
#editor = Editor("assets/video.mp4", "assets/video.mp4")

# @app.post("/traitement-video")
# def traitement_video(video: Video):
#     editor = Editor(video.video_haute_path, video.video_basse_path)
#     editor.traitementVideo()
#     if video.type == 1:
#         editor.divideEachXMinutes(video.divide_each_minutes)
#     elif video.type == 2:
#         editor.startNextVideoBeforeXSeconds(video.divide_each_minutes, video.start_before)
#     elif video.type == 3:
#         editor.divideWithCheckPoints(video.checkpoints)

@app.post("/subscribe")
@limiter.limit("30/minute")
def subscribe_list(request: Request, email: Waiter, db: Session = Depends(get_db)):
    wait_model = Models.WaitList()
    wait_model.email = email.email

    db.add(wait_model)
    db.commit()

    return email

@app.get("/delete_all")
def deleteAll(db: Session = Depends(get_db)):
    db.query(Models.WaitList).delete()
    db.commit()

    return "All emails deleted"

    


