from pydantic import BaseModel

class Password(BaseModel):
    currentpwd: str
    newpwd: str