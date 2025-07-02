"""
User-related Pydantic models
"""

from pydantic import BaseModel

# Shared properties
class UserBase(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    pass

# Properties stored in DB
class UserInDB(UserBase):
    hashed_password: str

# Properties to return to client
class User(UserBase):
    class Config:
        orm_mode = True
