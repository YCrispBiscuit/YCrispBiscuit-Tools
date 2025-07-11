"""
Documentations_MD_File model for database
数据库中MD文档的分区文件夹对应的数据源的 ORM 模型定义
"""


from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

# 创建基础类
Base = declarative_base()

class Documentations_MD_File(Base):
    __tablename__ = "documentations_md_file"

    Documentations_MD_File_ID=Column(Integer,primary_key=True)
    Documentations_ID=Column(Integer)
    Documentations_MD_File_Name=Column(String)
    Documentations_MD_File_Path=Column(String)


    