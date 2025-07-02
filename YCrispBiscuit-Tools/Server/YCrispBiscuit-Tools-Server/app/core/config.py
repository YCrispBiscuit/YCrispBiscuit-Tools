"""
项目基础配置文件
可用于存放数据库连接、环境变量、全局常量等配置
类似 Spring Boot 的 application.yml 或 application.properties
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 示例配置项
    APP_NAME: str = "YCrispBiscuit-Tools-Server"
    DEBUG: bool = False

    # Database settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "YCrispBiscuitTools"
    DATABASE_URL: str = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    # JWT settings
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
