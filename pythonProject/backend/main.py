from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно указать конкретные источники, если нужно
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель продукта
class Product(BaseModel):
    id: int
    name: str
    purchase_date: str
    expiry_date: str
    is_expired: bool = False

# Инициализация списка продуктов
products = []
current_id = 1

# Доступные продукты с их сроками годности
available_products = {
    "Банан": "14 дней",
    "Яйца": "30 дней",
    "Колбаса": "14 дней",
    "Молоко": "5 дней",
    "Сыр": "14 дней",
    "Хлеб": "3 дня",
    "Огурцы": "15 дней",
    "Помидоры": "7 дней",
    "Сметана": "4 дня",
    "Груши": "30 дней",
}

@app.post("/api/products", response_model=Product)
async def add_product(
        name: str = Form(...),
        purchase_date: str = Form(...),
        expiry_date: str = Form(...)
):
    global current_id
    product = Product(
        id=current_id,
        name=name,
        purchase_date=purchase_date,
        expiry_date=expiry_date,
        is_expired=False
    )
    products.append(product)
    current_id += 1
    return product

@app.get("/api/products", response_model=List[Product])
async def get_products():
    for product in products:
        purchase_date = datetime.strptime(product.purchase_date, '%Y-%m-%d')
        expiry_duration = int(product.expiry_date.split()[0])
        if datetime.now() >= purchase_date + timedelta(days=expiry_duration):
            product.is_expired = True
    return products

@app.get("/api/available-products", response_model=List[str])
async def get_available_products():
    return list(available_products.keys())

@app.get("/api/expiry-dates", response_model=dict)
async def get_expiry_dates():
    return available_products

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int):
    global products
    products = [product for product in products if product.id != product_id]
    return {"message": "Продукт удалён"}

# Обработка регистрации и входа (пример, без реальной логики)
@app.post("/api/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    return {"message": "Вход выполнен"}

@app.post("/api/auth/register")
async def register(email: str = Form(...), password: str = Form(...)):
    return {"message": "Регистрация выполнена"}
