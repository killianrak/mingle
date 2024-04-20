from pydantic import BaseModel
from typing import List

class VideoMinimumDuration(BaseModel):
    divide_each_minutes: float

class VideoStartBefore(BaseModel):
    divide_each_minutes: int
    start_before: int

class VideoCheckPoints(BaseModel):
    checkpoints: List[str]