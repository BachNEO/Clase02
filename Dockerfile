FROM python:3.12-slim

WORKDIR /app

# Copiar requirements desde la carpeta clase02
COPY clase02/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo desde la carpeta clase02
COPY clase02/ .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
