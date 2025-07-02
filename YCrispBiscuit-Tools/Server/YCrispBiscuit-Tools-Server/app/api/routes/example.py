from fastapi import APIRouter

router = APIRouter()

@router.get("/example")
def example():
    return {"msg": "This is a custom route."}
