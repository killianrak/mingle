from sqlalchemy import Column, Integer, String
from core.database import Base

class WaitList(Base):
    __tablename__ = "waitList"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)

class Users(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    password = Column(String)
    email = Column(String)

class UsersGoogleAuth(Base):
    __tablename__ = "UsersGoogleAuth"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    fullname = Column(String)





