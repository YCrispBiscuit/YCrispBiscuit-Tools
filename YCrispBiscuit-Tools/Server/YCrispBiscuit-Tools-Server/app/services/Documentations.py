from sqlalchemy.orm import Session
from app.repository.Documentations import (
    get_all_Documentations,
    get_Documentations_by_Key,
    create_Documentations
)   


# 查询所有分区
def list_documentations(db: Session):
    return get_all_Documentations(db)


# 查询指定Key的分区
def get_documentation_by_key(db: Session, key: str):
    return get_Documentations_by_Key(db, key)

# 创建新的分区
def create_documentation(db: Session, data: dict):
    