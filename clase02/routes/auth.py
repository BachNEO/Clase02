from fastapi import APIRouter, HTTPException

router = APIRouter()

# Lista temporal que simula una base de datos
usuarios_db = []

@router.post("/register")
def registrar_usuario(datos: dict):
    # Validar que se reciban correo y contraseña (admite contrasena sin tilde)
    if "correo" not in datos or ("contraseña" not in datos and "contrasena" not in datos):
        raise HTTPException(status_code=400, detail="Se requieren correo y contraseña")

    clave = datos.get("contraseña") or datos.get("contrasena")
    usuario = {"correo": datos["correo"], "contraseña": clave}

    usuarios_db.append(usuario)

    return {
        "mensaje": "Usuario registrado exitosamente",
        "datos": usuario
    }

@router.post("/login")
def iniciar_sesion(datos: dict):
    # Validar que se reciban correo y contraseña (admite contrasena sin tilde)
    if "correo" not in datos or ("contraseña" not in datos and "contrasena" not in datos):
        raise HTTPException(status_code=400, detail="Se requieren correo y contraseña")

    clave = datos.get("contraseña") or datos.get("contrasena")

    for usuario in usuarios_db:
        if usuario.get("correo") == datos["correo"] and usuario.get("contraseña") == clave:
            return {
                "mensaje": "Login exitoso",
                "datos": datos
            }

    raise HTTPException(status_code=401, detail="Credenciales incorrectas")