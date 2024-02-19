from pydantic import BaseModel
from typing import List, Optional, Tuple

class VideoMinimumDuration(BaseModel):
    divide_each_minutes: int

class VideoStartBefore(BaseModel):
    divide_each_minutes: int
    start_before: int

class VideoCheckPoints(BaseModel):
    checkpoints: List[Tuple[str, str]]