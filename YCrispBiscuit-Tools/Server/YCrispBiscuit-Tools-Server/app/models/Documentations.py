"""
Documentations model for database
数据库中MD文档的分区文件夹对应的数据源的 ORM 模型定义
"""


from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

# 创建基础类
Base = declarative_base()

class Documentations(Base):
    __tablename__ = "documentations"

    Documentations_ID=Column(Integer,primary_key=True)
    Documentations_Key=Column(String)
    Documentations_Title=Column(String)
    Documentations_Desc=Column(String)
    Documentations_Details=Column(String)
    Documentations_Icon=Column(String)

    