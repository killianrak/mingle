from typing import Union
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str

class UserInDB(User):
    hashed_password: str

class GoogleToken(BaseModel):
    idToken: str