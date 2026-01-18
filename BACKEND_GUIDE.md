# Guía de Configuración del Backend Python

## Configuración de CORS

### Opción 1: FastAPI (Recomendado)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend en desarrollo
        "http://localhost:5173",  # Vite alternativo
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ejemplo de endpoint
@app.get("/api/documents/pending")
async def get_pending_documents():
    return {
        "documents": [
            {
                "id": "DOC_001",
                "name": "pasaporte.pdf",
                "category": "Identificación",
                "status": "EN ESPERA"
            }
        ]
    }
```

### Opción 2: Flask

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Configurar CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Ejemplo de endpoint
@app.route("/api/documents/pending")
def get_pending_documents():
    return jsonify({
        "documents": [
            {
                "id": "DOC_001",
                "name": "pasaporte.pdf",
                "category": "Identificación",
                "status": "EN ESPERA"
            }
        ]
    })
```

### Opción 3: Django REST Framework

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Configuración CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

## Estructura de Endpoints Requeridos

### 1. Módulo de Documentos (Escenario 1.1)

```python
# GET /api/documents/pending
# Retorna lista de documentos sin vincular
{
    "documents": [
        {
            "id": "DOC_002",
            "name": "record_policial.pdf",
            "category": "Antecedentes Penales",
            "status": "EN ESPERA",
            "size": "2.3 MB",
            "date": "2026-01-15"
        }
    ]
}

# POST /api/documents/{document_id}/link
# Body: { "caseId": "TR-B02" }
# Retorna: { "success": true, "message": "Documento vinculado exitosamente" }

# GET /api/cases/{case_id}/documents
# Retorna documentos de un trámite específico

# PATCH /api/documents/{document_id}/status
# Body: { "status": "RECIBIDO" }
```

### 2. Módulo OCR (Escenario 1.2)

```python
# POST /api/ocr/process/{document_id}
# Inicia procesamiento OCR
{
    "status": "COMPLETADO",
    "confidence": 0.95,
    "fields": {
        "Número de Cédula": {
            "value": "1710010010",
            "confidence": 0.98
        },
        "Nombre": {
            "value": "JUAN CARLOS",
            "confidence": 0.96
        }
    }
}

# GET /api/ocr/results/{document_id}
# Obtiene resultados de extracción

# PUT /api/ocr/manual-update/{document_id}
# Body: { "fields": { "Nombre": "JUAN CORREGIDO" } }

# POST /api/ocr/manual-review/{document_id}
# Body: { "fields": ["Apellido"] }
```

### 3. Módulo de Validación (Escenario 1.3)

```python
# POST /api/validation/profile/{profile_id}
{
    "status": "VALIDADO_LEGALMENTE",
    "civilRegistry": {
        "active": true,
        "civilStatus": "CASADO",
        "officialName": "JUAN PEREZ",
        "match": true
    },
    "migrationPolice": {
        "impediment": false,
        "reason": "N/A"
    }
}

# GET /api/validation/status/{profile_id}

# GET /api/validation/civil-registry/{cedula}

# GET /api/validation/migration-police/{cedula}
```

### 4. Módulo de Citas (Escenario 2.1)

```python
# GET /api/appointments/availability?date=2025-06-15&agentId=AGENTE_01
{
    "availability": [
        {
            "time": "10:00",
            "status": "LIBRE"
        },
        {
            "time": "11:00",
            "status": "OCUPADO"
        }
    ]
}

# POST /api/appointments
# Body: {
#   "caseId": "TR-OK",
#   "agentId": "AGENTE_01",
#   "date": "2025-06-15",
#   "time": "11:00"
# }

# PUT /api/appointments/{appointment_id}/reschedule
# Body: { "newDate": "2025-06-20" }

# DELETE /api/appointments/{appointment_id}
```

## Instalación de Dependencias

### FastAPI
```bash
pip install fastapi uvicorn python-multipart
pip install python-jose[cryptography]  # Para JWT
```

### Flask
```bash
pip install flask flask-cors
pip install flask-jwt-extended  # Para JWT
```

### Django
```bash
pip install django djangorestframework
pip install django-cors-headers
```

## Ejecución del Servidor

### FastAPI
```bash
uvicorn main:app --reload --port 8000
```

### Flask
```bash
python app.py
# o
flask run --port 8000
```

### Django
```bash
python manage.py runserver 8000
```

## Autenticación JWT

### Ejemplo FastAPI

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

# Proteger endpoint
@app.get("/api/documents/pending")
async def get_documents(user = Depends(verify_token)):
    # Solo usuarios autenticados pueden acceder
    return {"documents": [...]}
```

## Testing de Endpoints

Puedes probar los endpoints con:

1. **Postman/Insomnia**: Herramientas GUI para testing de APIs
2. **curl**: Línea de comandos
   ```bash
   curl -X GET http://localhost:8000/api/documents/pending
   ```
3. **HTTPie**: Alternativa más amigable a curl
   ```bash
   http GET :8000/api/documents/pending
   ```

## Variables de Entorno

Crea un archivo `.env`:

```env
SECRET_KEY=tu_clave_secreta_muy_segura
DATABASE_URL=postgresql://user:password@localhost/db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
PORT=8000
```

Y úsalas en tu código:

```python
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
CORS_ORIGINS = os.getenv("CORS_ORIGINS").split(",")
```
