from fastapi import APIRouter
from app.services import hello

router = APIRouter()

@router.get("/")
def read_root():
    return hello.say_hello()


@router.get("/users")
def read_users():
    return hello.list_users()