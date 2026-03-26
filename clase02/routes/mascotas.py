from fastapi import APIRouter, HTTPException
from routes.servicios import servicios_db

router = APIRouter()

mascotas_db = []

@router.post("/registrar-mascota")
def registrar_mascota(datos: dict):
    # Validar que se reciban los campos requeridos
    campos_requeridos = ["correo", "nombre", "servicio", "fecha"]
    for campo in campos_requeridos:
        if campo not in datos:
            raise HTTPException(status_code=400, detail=f"Se requiere el campo {campo}")
    
    # Agregar a la lista temporal
    mascotas_db.append(datos)
    
    return {
        "mensaje": "Mascota registrada exitosamente",
        "datos": datos
    }

@router.get("/mascotas/{correo}")
def obtener_mascotas(correo: str):
    # Filtrar la lista mascotas_db por correo
    mascotas = [mascota for mascota in mascotas_db if mascota.get("correo") == correo]
    
    return {
        "mascotas": mascotas
    }

@router.get("/reporte/{correo}")
def obtener_reporte(correo: str):
    # Filtrar la lista mascotas_db por correo
    mascotas = [mascota for mascota in mascotas_db if mascota.get("correo") == correo]
    
    # Calcular el gasto total
    total = 0
    servicios = []
    for mascota in mascotas:
        servicio = mascota.get("servicio")
        servicios.append(servicio)
        # Buscar el precio del servicio en servicios_db
        for s in servicios_db:
            if s.get("nombre") == servicio:
                total += s.get("precio")
                break
    
    return {
        "total_servicios": len(mascotas),
        "servicios": servicios,
        "gasto_total": total
    }