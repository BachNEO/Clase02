from fastapi import APIRouter, HTTPException

router = APIRouter()

# Lista temporal que simula una base de datos
usuarios_db = []

@router.post("/register")
def registrar_usuario(datos: dict):
    # Validar que se reciban correo y contraseña
    if "correo" not in datos or "contraseña" not in datos:
        raise HTTPException(status_code=400, detail="Se requieren correo y contraseña")
    
    # Agregar a la lista temporal
    usuarios_db.append(datos)
    
    return {
        "mensaje": "Usuario registrado exitosamente",
        "datos": datos
    }

@router.post("/login")
def iniciar_sesion(datos: dict):
    # Validar que se reciban correo y contraseña
    if "correo" not in datos or "contraseña" not in datos:
        raise HTTPException(status_code=400, detail="Se requieren correo y contraseña")
    
    # Buscar usuario en la lista temporal
    for usuario in usuarios_db:
        if usuario.get("correo") == datos["correo"] and usuario.get("contraseña") == datos["contraseña"]:
            return {
                "mensaje": "Login exitoso",
                "datos": datos
            }
    
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")