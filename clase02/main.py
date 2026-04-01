from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from routes.servicios import router as servicios_router
from routes.auth import router as auth_router
from routes.mascotas import router as mascotas_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def saludar():
    return {"mensaje": "¡Hola! Bienvenido a mi API"}

@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"mensaje": f"Hola {nombre}, ¡qué bueno verte por aquí!"}

@app.get("/fecha")
def dame_la_hora():
    ahora = datetime.now()
    return {
        "fecha": ahora.strftime("%Y-%m-%d"),
        "hora": ahora.strftime("%H:%M:%S"),
        "iso": ahora.isoformat()
    }

# Incluir los routers
app.include_router(servicios_router)
app.include_router(auth_router)
app.include_router(mascotas_router)
