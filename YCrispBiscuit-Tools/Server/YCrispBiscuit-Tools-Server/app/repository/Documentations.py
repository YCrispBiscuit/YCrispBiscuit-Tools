"""
Documentations repository for database operations
数据库中MD文档的分区文件夹相关的数据库操作方法（全部原生SQL写法）
"""

from sqlalchemy.orm import Session
from sqlalchemy import text


# 获取所有分区
def get_all_Documentations(db: Session)-> list:
    sql = ("SELECT * FROM documentations")
    result = db.execute(text(sql))  # 执行SQL，返回ResultProxy
    rows = result.fetchall()  # 获取所有结果
    # 转换为字典列表
    return [dict(row._mapping) for row in rows]



# 获取指定Key的分区,Key是分区的唯一标识符
def get_Documentations_by_Key(db: Session, key: str) -> object:
    sql = ("SELECT * FROM documentations WHERE Documentations_Key = :key")
    result = db.execute(text(sql), {"key": key})  # 传入参数字典，防止SQL注入
    return result.fetchone()  # 获取单条结果，找不到返回None


# 创建新的分区
def create_Documentations(db: Session, data: dict) -> int:
    sql = ("""
    INSERT INTO documentations (Documentations_Key, Documentations_Title, Documentations_Desc,Documentations_Details,Documentations_Icon)
    VALUES (:key, :title, :description,:details, :icon)
    """)
    result = db.execute(text(sql), {
        "key": data.get("Documentations_Key"),
        "title": data.get("Documentations_Title"),
        "description": data.get("Documentations_Desc"),
        "details": data.get("Documentations_Details"),
        "icon": data.get("Documentations_Icon")
    })
    db.commit()  # 提交事务
    return 1 if result.rowcount > 0 else 0


# 更新指定Key的分区
def update_Documentations(
        db: Session,
        key: str, 
        Documentations_Title: str = None,
        Documentations_Desc: str = None,
        Documentations_Details: str = None,
        Documentations_Icon: str = None
    ) -> int:
    sql = ("UPDATE documentations SET ")
    params = {"key": key}  # 初始化参数字典，包含Key
    set_list = []
    if Documentations_Title is not None:
        set_list.append("Documentations_Title = :title")
        params["title"] = Documentations_Title
    if Documentations_Desc is not None:
        set_list.append("Documentations_Desc = :description")
        params["description"] = Documentations_Desc
    if Documentations_Details is not None:
        set_list.append("Documentations_Details = :details")
        params["details"] = Documentations_Details
    if Documentations_Icon is not None:
        set_list.append("Documentations_Icon = :icon")
        params["icon"] = Documentations_Icon
        if not set_list:
            return 0
    sql += ", ".join(set_list)
    sql += " WHERE Documentations_Key = :key"  # 添加条件
    result = db.execute(text(sql), params)  # 执行更新语句
    db.commit()  # 提交事务
    return 1 if result.rowcount > 0 else 0  # 返回受影响的行数
