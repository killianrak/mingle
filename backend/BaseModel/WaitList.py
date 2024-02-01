from pydantic import BaseModel

class WaitList(BaseModel):
    email: str