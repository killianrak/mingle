from pydantic import BaseModel
from typing import List, Optional, Tuple

class Video(BaseModel):
    type: int
    video_haute_path: str
    video_basse_path: str
    divide_each_minutes: Optional[int] = None
    start_before: Optional[int] = None
    checkpoints: Optional[List[Tuple[str, str]]]