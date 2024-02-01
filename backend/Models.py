from sqlalchemy import Column, Integer, String
from database import Base

class WaitList(Base):
    __tablename__ = "waitList"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)




