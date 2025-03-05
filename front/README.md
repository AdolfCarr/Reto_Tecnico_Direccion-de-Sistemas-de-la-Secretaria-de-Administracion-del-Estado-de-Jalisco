<p align="center">
  <a href="https://raw.githubusercontent.com/" target="blank">
    <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/typescript.png" width="60" alt="NestJS Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://raw.githubusercontent.com" target="blank">
    <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/angular.png" width="60" alt="PostgreSQL Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://www.docker.com/" target="blank">
    <img src="https://raw.githubusercontent.com/docker-library/docs/master/docker/logo.png" width="60" alt="Docker Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://docs.docker.com/compose/" target="blank">
    <img src="https://raw.githubusercontent.com/docker/compose/master/logo.png" width="60" alt="Docker Compose Logo" />
  </a>
</p>

# Frontend for IIEG Transport Statistics (Dockerized)

A **Angular** frontend for interacting with transport statistics data from the **IIEG API**, stored in **PostgreSQL**.

## Ejecucion local (from `commit 1423a7a3442795a2e53e51eaee8f1186ce0c9bc2`)

1. Ejecutar el backend con Docker.

   Desde el directorio raíz del proyecto backend (donde está el docker-compose.yml)

```bash
docker-compose up --build
```
Verifica que ambos servicios estén corriendo:

```bash
docker ps
```

Debes ver 2 contenedores activos:

- transporte-db (PostgreSQL)
- transporte-back (Backend NestJS)

```bash
 STATUS                 NAMES
 Up 5 hours             transporte-db  
 Up 5 hours             transporte-back
 ```

2. Verificar su funcionamiento.

Prueba el registro con formato JSON correcto (evita problemas de comillas en Windows):

```bash
curl -X POST http://localhost:4000/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"testuser\", \"password\": \"Testpassword!\"}"
```

Example Response:

```json
{"id":12,
"username":"testuser","password":"$2b$10$TEHYYBrN7b2UcoIXcEwLbe3ZeWX7n0gWKMTSt8xIK7Z9SSIiHA2y"}
```

3. **Log In to Get a JWT Token**

Now that the user is registered, you can log in to get a JWT token.

Login Command:
```bash
# for windows cmd
curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"password\": \"testpassword\"}"
```

Example Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Copy the access_token value. You’ll use it in the next step.

4. **Call the Protected Endpoint**
Use the access_token to call the protected GET /data endpoint.

Example Command:

```bash
# for windows cmd
curl -X GET "http://localhost:4000/data?startYear=2020" -H "Authorization: Bearer <your_access_token>"
```

Replace <your_access_token> with the token you obtained in Step 2.

Possible expected data structure:

```json
[
  {
    "id": "665e1214eb09d28a75840855",
    "year": 2020,
    "month": 1,
    "transportType": {
      "id": 1,
      "name": "Tren Eléctrico"
    },
    "metricType": {
      "id": 1,
      "name": "Ingresos por pasaje"
    },
    "entity": "Jalisco",
    "municipality": "Guadalajara",
    "value": "45270437.00",
    "status": "Cifras Definitivas"
  },
  {
    "id": "665e1214eb09d28a75840856",
    "year": 2020,
    "month": 1,
    "transportType": {
      "id": 1,
      "name": "Tren Eléctrico"
    },
    "metricType": {
      "id": 2,
      "name": "Kilómetros recorridos"
    },
    "entity": "Jalisco",
    "municipality": "Guadalajara",
    "value": "508340.00",
    "status": "Cifras Definitivas"
  }
]

```

> [!WARNING]
> JWT tokens are time-limited and will expire after a certain 
> period. This is a security feature to ensure that tokens are 
> not valid indefinitely. When a token expires, you will need 
> to log in again to obtain a new token.

5. **If recieving an empty Json sync data**

```bash
# recieved an empty Json
[]
```
Database is empty or doesn’t have the required data, sync the data from the external API.

You should get a JWT token before executing the `curl -X POST http://localhost:4000/data/sync` command because the /data/sync endpoint is protected by the AuthGuard('jwt'). This is because the AuthGuard('jwt') ensures that only authenticated users (with a valid JWT token) can access the endpoint.

Use the JWT token to access the /data/sync endpoint.

```bash
curl -X POST http://localhost:4000/data/sync -H "Authorization: Bearer <your_access_token>"
```
Replace ``<your_access_token>`` with the token you obtained from the login response.

Expected Response:
```json
{
  "message": "Data synchronization completed"
}
```

After syncing, check the database again to ensure the data has been populated, conside that you need to be authenticated.

6. **If last steps succesful then the backend is fully working.**

Common solutions:

```bash
# Removes all unused Docker objects to free up disk space
docker system prune -a --volumes

# Remove old containers and volumes
docker-compose down -v

# Borra y recrea los contenedores
docker-compose build --no-cache
docker-compose up

# Construir y levantar
docker-compose down -v && docker-compose up --build
```

Conéctate a la base de datos:

```bash
docker exec -it transporte-db psql -U transporte_user -d transporte_db
```
Verifica la tabla de usuarios:

```sql
SELECT * FROM "user";
```
Verificar usuario de prueba registrado:

```sql
SELECT FROM "user" WHERE username = 'testuser';
```

## Build up the Angular server

If the backend works as spected, then continue to the local build up of the Angular server.

1. **Verifica tu versión de Angular**
Este frontend Angular fue desarrollado en Angular CLI: 19.2.0, asi que probablemente una version anterior no funcione como se prevee.

```bash
ng version
```

Para ejecutar el proyecto:

Asegúrate que el backend esté corriendo en http://localhost:4000

2. **Ejecuta el frontend**

```bash
ng serve
```

3. **http://localhost:4200/**

Ingresa en el browser `http://localhost:4200/`

Registra un nuevo usuario o ingresa con el creado previamente con el comnado `curl` desde `cmd`.

## 🚀 Deployment with Docker(from `commit 246dcfec34b641fa30e39791f6973fae4b412ca4`)

### Prerequisites

- **Docker** & **Docker Compose** installed
- `git`

### Description

- **The objective:**

  Generate a simple graphic interface to automate extraction of information from the following source via backend-frontend: [IIEG API](https://iieg.gob.mx/ns/?page_id=36831), through a login logout form and a dashboard to interc with the data.

### Project setup

The project is **dockerized**, so clone it and run the following command inside the root folder of the project through the command line.

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AdolfCarr/Reto_Tecnico_Direccion-de-Sistemas-de-la-Secretaria-de-Administracion-del-Estado-de-Jalisco.git
   cd transporte-stats
   ``

2. **Run the system with Docker**

Build and start containers:

```bash
# Remove old containers and volumes
docker-compose down -v
# Recrea los contenedores
docker-compose build --no-cache
docker-compose up
```

3. **Check containers**

```bash
docker ps -a
```

4. **Restart containers if needed**

```bash
# Remove old containers and volumes
docker-compose down -v

# Build and start
docker-compose up --build

# This will show the logs in real-time.
docker-compose up --build --force-recreate

# Use the --detach flag to run in the background:
docker-compose up --build --detach

# Check status
docker ps -a
```

### Data Extraction
1. **Manual Execution**


2. **Scheduled Execution (Daily 3AM)**

Already configured via:

```typescript
@Cron('0 3 * * *') // In data-sync.task.ts
```

### Verification Final Steps

1. **Test App on the browser**

Go to:

```http
http://localhost
```

2. **Verify data in PostgreSQL**

Access PostgreSQL:

```bash
# Acceder a PostgreSQL:
docker exec -it transporte-db psql -U transporte_user -d transporte_db
```
Once inside the database, you can check tables and data:

```bash
# See tables
\dt

# View data in transport_data
SELECT * FROM transport_data LIMIT 5;

# View transport types
SELECT * FROM transport_type;

# View metrics
SELECT * FROM metric_type;

# Count records in transport_data
SELECT COUNT(*) FROM transport_data;

```

3. **Monitor logs**

To monitor logs in real-time:

```bash
docker logs transporte-back --follow
```

```bash
docker logs transporte-front --follow
```

> [!IMPORTANT]
> *The backend will be operational at* http://localhost:4000

### Common Troubleshooting

 #### Check the Database

1. Connect to your PostgreSQL database using a tool like `cmd` in windows and with the Backend container running execute the next command.

```bash
docker exec -it transporte-db psql -U transporte_user -d transporte_db;
```

2. Run the following query to check if the user exists:

```sql
SELECT * FROM "user" WHERE username = 'testuser';
```

- If no rows are returned, the user does not exist.

- If the user exists, verify that the password column contains a valid bcrypt hash.

### Frontend Workflow
#### Registration:

1. El usuario ingresa sus datos en el formulario de registro:

   - El usuario proporciona información como nombre de usuario, contraseña, y cualquier otro dato requerido (por ejemplo, correo electrónico).

2. El frontend envía los datos al backend:

   - El formulario de registro llama al método register() del servicio AuthService.

   - Se realiza una solicitud HTTP POST al endpoint /users/register del backend.

3. El backend procesa la solicitud de registro:

   - El backend recibe los datos del usuario.

   - Valida que los datos sean correctos (por ejemplo, que el nombre de usuario no esté en uso).

   - Hashea la contraseña usando un algoritmo seguro (por ejemplo, bcrypt).

4. El backend almacena el usuario en la base de datos PostgreSQL:

   - El backend ejecuta una consulta SQL para insertar el nuevo usuario en la tabla users de la base de datos PostgreSQL.

   - La contraseña se almacena en forma de hash, no en texto plano.

5. El backend responde al frontend:

   - Si el registro es exitoso, el backend devuelve una respuesta de éxito (por ejemplo, un mensaje o un código de estado 201).

   - Si hay un error (por ejemplo, el nombre de usuario ya existe), el backend devuelve un mensaje de error.

6. El frontend maneja la respuesta:

   - Si el registro es exitoso, el frontend redirige al usuario a la página de login.

   - Si hay un error, el frontend muestra un mensaje de error al usuario.

#### Login:

1. El usuario ingresa sus credenciales:

   - El usuario escribe su nombre de usuario y contraseña en el formulario de login.

2. El frontend envía las credenciales al backend:

   - El formulario de login llama al método login() del servicio AuthService.

   - Se realiza una solicitud HTTP POST al endpoint /auth/login del backend.

3. El backend valida las credenciales:

   - El backend verifica si el usuario existe y si la contraseña es correcta.

   - Si las credenciales son válidas, el backend genera un token JWT (JSON Web Token) y lo devuelve al frontend.

4. El frontend almacena el token:

   - El frontend recibe el token y lo guarda en el localStorage o sessionStorage.

   - El token se usa para autenticar solicitudes futuras al backend.

5. El frontend redirige al usuario al dashboard:

   - Después de un login exitoso, el usuario es redirigido a la página de dashboard (o cualquier otra ruta protegida).

#### Logout:
1. El usuario hace clic en el botón de logout:

   - El botón de logout llama al método logout() del servicio AuthService.

2. El frontend elimina el token:

   - El token se elimina del localStorage o sessionStorage.

3. El frontend redirige al usuario a la página de login:

   - Después de eliminar el token, el usuario es redirigido a la página de login.

4. El backend invalida el token (opcional):

   - Si el backend tiene un sistema de invalidación de tokens, el frontend puede enviar una solicitud para invalidar el token actual.

**Final Thoughts**
- The user only needs to enter their plain text password during login.

- The system handles password hashing and comparison automatically.

- If the password is currently stored in plain text, hash it once and update the database.

