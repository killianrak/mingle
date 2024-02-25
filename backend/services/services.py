from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Request, status
import magic
from BaseModel.Auth import UserInDB
from core.Models import Users
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy.orm import Session
import os

class Services:

    SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    def __init__(self, db: Session):

        self.__pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.db = db

    def get_password_hash(self, password):
        return self.__pwd_context.hash(password)

    def create_new_user(self, data, db):
        user = db.query(Users).filter(Users.email == data.email).first()
        if user:
            raise HTTPException(status_code=409, detail="Email already subscribed.")
        new_user = Users(
            username = data.username,
            email = data.email,
            password = self.get_password_hash(data.password)
        )
        db.add(new_user)
        db.commit()
        return new_user

    def verify_password(self, plain_password, hashed_password):
        return self.__pwd_context.verify(plain_password, hashed_password)

    def get_user(self, db, username: str):
        user = db.query(Users).filter(Users.username == username).first()
        if user:
            return UserInDB(username = user.username, email = user.email, hashed_password = user.password)


    def authenticate_user(self, db, username: str, password: str):
        user = self.get_user(db, username)
        if not user:
            return False
        if not self.verify_password(password, user.hashed_password):
            return False
        return user


    def create_access_token(self, data: dict, expires_delta: timedelta | None = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt
    

    # async def get_current_user(self, token: str = Depends(oauth2_scheme)):
    #     credentials_exception = HTTPException(
    #         status_code= status.HTTP_401_UNAUTHORIZED,
    #         detail="Could not validate credentials",
    #         headers={"WWW-Authenticate": "Bearer"},
    #     )
    #     try:
    #         payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
    #         username: str = payload.get("sub")
    #         if username is None:
    #             raise credentials_exception
    #         token_data = TokenData(username=username)
    #     except JWTError:
    #         raise credentials_exception
    #     user = self.get_user(db, username=token_data.username)
    #     if user is None:
    #         raise credentials_exception
    #     return user
    
    async def save_file(self, file_upload):
        data = await file_upload.read()
        original_filename = file_upload.filename
        save_to = f"assets/{original_filename}"
        
        # Vérifier si le fichier existe déjà dans le dossier de destination
        count = 1
        while os.path.exists(save_to):
            # Générer un nouveau nom de fichier en ajoutant un numéro de séquence au nom original
            filename, ext = os.path.splitext(original_filename)
            new_filename = f"{filename}_{count}{ext}"
            save_to = f"assets/{new_filename}"
            count += 1

        # Enregistrer le fichier avec le nouveau nom (ou le nom original si aucun conflit de nom)
        with open(save_to, "wb") as f:
            f.write(data)

        return save_to

    def checkVideoFormat(self, save_video, save_gameplay):
        mime = magic.Magic(mime=True)
        video_file_type = mime.from_file(save_video)      
        gameplay_file_type = mime.from_file(save_gameplay)
        
        video_filename = os.path.basename(save_video)
        gameplay_filename = os.path.basename(save_gameplay)
        if video_filename == gameplay_filename:
            os.remove(save_video)
            os.remove(save_gameplay)
            raise HTTPException(status_code=422, detail="Les deux videos doivent être differentes.")
        
        if  video_file_type.find("video") == -1 or gameplay_file_type.find("video") == -1:
            os.remove(save_video)
            raise HTTPException(status_code=422, detail="Seuls les fichiers vidéo sont autorisés")
 
    def checkCookie(self, request: Request):
        try:
            print(request.cookies)
            # Obtenez le cookie d'accès de la requête
            access_token_cookie = request.cookies.get("access_token", "")

            # Vérifiez si le cookie est présent
            if not access_token_cookie:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Cookie d'accès manquant",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        except HTTPException as e:
            raise e  # Transmettez les exceptions HTTP directement
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cookie d'accès invalide",
                headers={"WWW-Authenticate": "Bearer"},
            )     