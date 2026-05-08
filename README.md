# Sistema de Gestión de Planillas - SU

Sistema web completo para la gestión de planillas de personal, permisos, ingresos y descuentos.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tech Stack](#tech-stack)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Servicios](#servicios)
- [API Endpoints](#api-endpoints)
- [Desarrollo Local](#desarrollo-local)
- [Comandos Docker](#comandos-docker)
- [Solución de Problemas](#solución-de-problemas)

---

## Descripción

Sistema de nómina profesional desarrollado para gestionar de manera eficiente:

- **Personal**: Registro y administración de empleados
- **Planillas**: Generación y control de nóminas mensuales
- **Haberes**: Ingresos y beneficios por empleado
- **Descuentos**: Deducciones legales y otras
- **Importación**: Carga masiva desde archivos Excel
- **Dashboard**: Resumen general de datos

---

## Tech Stack

| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| **Frontend** | React 18 + TypeScript + Vite | Interfaz de usuario moderna |
| **Estilos** | TailwindCSS | Diseño responsivo y componentes |
| **Backend** | Go 1.25 + Gin + GORM | API REST de alto rendimiento |
| **Base de Datos** | PostgreSQL 18 | Almacenamiento relacional |
| **Procesamiento** | Python 3.11 + Pandas + Flask | Manipulación de archivos Excel |
| **Contenedores** | Docker + Docker Compose | Despliegue simplificado |

---

## Estructura del Proyecto

```
PLANILLASU/
├── frontend/           # Aplicación React con Vite
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/     # Páginas de la aplicación
│   │   ├── services/  # Servicios API
│   │   └── App.tsx    # Componente principal
│   ├── nginx.conf     # Configuración Nginx
│   ├── Dockerfile    # Imagen del contenedor
│   └── package.json
├── backend/           # API REST en Go
│   ├── handlers/     # Controladores HTTP
│   ├── models/       # Modelos de datos
│   ├── main.go       # Punto de entrada
│   ├── Dockerfile
│   └── go.mod / go.sum
├── python-excel/      # Servicio de procesamiento Excel
│   ├── app.py        # Aplicación Flask
│   ├── Dockerfile
│   └── requirements.txt
├── docker/           # Scripts de base de datos
│   └── init.sql     # Inicialización de BD
├── docker-compose.yml # Orquestación de servicios
└── README.md       # Este archivo
```

---

## Requisitos Previos

- **Docker Desktop** (Windows/Mac) o Docker Engine (Linux)
- **Docker Compose** (incluido en Docker Desktop)
- **8GB RAM mínimo** recomendado

---

## Instalación

### 1. Iniciar los servicios

```bash
docker compose up -d
```

### 2. Esperar (~1-2 minutos) y acceder a:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Python Excel | http://localhost:8081 |

---

## Configuración

### Puertos por Defecto

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| PostgreSQL | 5432 | Base de datos |
| Backend | 8080 | API REST Go |
| Python | 8081 | Servicio Excel |
| Frontend | 5173 | Interfaz web |

### Variables de Entorno

#### PostgreSQL (docker-compose)

```yaml
POSTGRES_USER: planillas
POSTGRES_PASSWORD: planillas2024
POSTGRES_DB: planillas
```

#### Backend (docker-compose)

```yaml
DATABASE_URL: postgres://planillas:planillas2024@postgres:5432/planillas?sslmode=disable
```

#### Python Excel (docker-compose)

```yaml
BACKEND_URL: http://backend:8080
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:8080
```

### Credenciales

```
Host: localhost:5432
Usuario: planillas
Contraseña: planillas2024
Base de datos: planillas
```

---

## Servicios

### Frontend (Puerto 5173)

Nginx sirviendo la aplicación React. Proxy inverso configurado para:
- `/api` → Backend (8080)
- `/python` → Python Excel (8081)

### Backend (Puerto 8080)

API REST en Go con los siguientes módulos:
- Autenticación (usuarios)
- Personal
- Planillas
- Ingresos
- Descuentos
- Importación Excel/JSON
- Dashboard

Base de datos PostgreSQL con AutoMigrate.

### Python Excel (Puerto 8081)

Servicio Flask para procesamiento de archivos Excel:
- `/health` - Estado del servicio
- `/process-excel` - Procesar archivo Excel
- `/validate-excel` - Validar estructura

### PostgreSQL (Puerto 5432)

PostgreSQL 18 Alpine con inicialización automática.

---

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/usuarios/login` | Iniciar sesión |
| POST | `/api/usuarios/registro` | Registrar usuario |

### Personal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/personal` | Listar todo el personal |
| GET | `/api/personal/:id` | Obtener empleado |
| GET | `/api/personal/buscar` | Buscar empleados |
| POST | `/api/personal` | Crear empleado |
| PUT | `/api/personal/:id` | Actualizar empleado |
| DELETE | `/api/personal/:id` | Eliminar empleado |

### Planillas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/planillas` | Listar planillas |
| POST | `/api/planillas` | Crear planilla |
| GET | `/api/planillas/:id` | Ver planilla |
| PUT | `/api/planillas/:id` | Actualizar planilla |
| DELETE | `/api/planillas/:id` | Eliminar planilla |

### Ingresos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/planillas/:id/ingresos` | Ver ingresos |
| POST | `/api/ingresos` | Crear ingreso |
| PUT | `/api/ingresos/:id` | Actualizar ingreso |
| DELETE | `/api/ingresos/:id` | Eliminar ingreso |

### Descuentos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/planillas/:id/descuentos` | Ver descuentos |
| POST | `/api/descuentos` | Crear descuento |
| PUT | `/api/descuentos/:id` | Actualizar descuento |
| DELETE | `/api/descuentos/:id` | Eliminar descuento |

### Importación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/importar/excel` | Importar desde Excel |
| POST | `/api/importar/json` | Importar desde JSON |
| POST | `/api/importar/haberes` | Importar haberes |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/resumen` | Resumen general |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |
| GET | `/uploads/*filepath` | Archivos subidos |

---

## Desarrollo Local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
go mod download
go run main.go
```

### Python Excel

```bash
cd python-excel
pip install -r requirements.txt
python app.py
# o
gunicorn --bind 0.0.0.0:8081 app:app
```

---

## Comandos Docker

```bash
# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Ver logs de un servicio
docker compose logs -f backend

# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v

# Rebuild y ejecutar
docker compose up -d --build

# Ver estado
docker compose ps

# Acceder a un contenedor
docker exec -it planillas-backend sh
docker exec -it planillas-postgres psql -U planillas
```

---

## Solución de Problemas

### El contenedor no inicia

1. Verificar que Docker esté ejecutándose
2. Ejecutar `docker compose logs` para ver errores específicos

### Error de conexión a la base de datos

1. Esperar más tiempo (PostgreSQL tarda en inicializar)
2. Verificar el healthcheck: `docker compose ps`

### Frontend no conecta al backend

1. Verificar que el backend esté ejecutándose en el puerto 8080
2. Revisar la URL en `frontend/.env`

### Error 502 Bad Gateway (Python)

1. Verificar que python-excel esté corriendo: `docker compose ps`
2. Verificar logs: `docker compose logs python-excel`

### Resetear todo el sistema

```bash
docker compose down -v
docker compose up -d --build
```

---

## Licencia

MIT License