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

## Ejecucion local

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
#removes all unused Docker objects to free up disk space
docker system prune -a --volumes

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

## 🚀 Deployment with Docker

### Prerequisites

- **Docker** & **Docker Compose** installed
- `git`

### Description

- **The objective:**

  Automate extraction (not manual) of information from the following source via backend: [IIEG API](https://iieg.gob.mx/ns/?page_id=36831), and store it in a SQL-based database (PostgreSQL).

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
docker-compose up --build
```

3. **Check containers**

```bash
docker ps -a
```

4. **Access the API**

Access the API through the browser or with curl:

```bash
http://localhost:4000/data?startYear=2020&transportType=Tren Eléctrico
```
or in `cmd`

```bash
curl http://localhost:4000/data?startYear=2020&transportType=Tren Eléctrico

```

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

If recieving an empty Json then see the section `Data Extraction` on this document to resolve.

```bash
# recieved an empty Json
[]
```


5. **Restart containers if needed**

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

```bash
docker exec transporte-back node -r ts-node/register src/scripts/fetch-data.ts
```

2. **Scheduled Execution (Daily 3AM)**

Already configured via:

```typescript
@Cron('0 3 * * *') // In data-sync.task.ts
```

### Verification Final Steps

1. **Test API on the browser**

Go to:

```http
http://localhost:4000/data
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

> [!IMPORTANT]
> *The backend will be operational at* http://localhost:4000

### Common Troubleshooting

1. **Data is not being saved:**

Receiving an empty JSON when testing the API in the browser

```bash
# recieved an empty Json
[]
```

Force the extraction of data when starting the app instead of relying on the cron job. Call fetchAndSaveData() automatically.

Run the following from Docker:

Run from Docker:
```bash
docker exec transporte-back node -r ts-node/register src/scripts/fetch-data.ts
```

2. **If everything fails**

Restart everything::

```bash
docker-compose down -v && docker-compose up --build
```

> [!CAUTION]
> *The last instructions are for the branch 'backend' on its **commit 231da5f299abfaf095955e050cd215a9ae98abd4**

## Test the final version of the Endpoint on ` commit bd730420fbcf85cf51aebc9e7d0709b1b4240d8d (origin/backend, backend)`

>[!INFORMATION]
After applying JWT Authantication, the Login and Logout features follow the next instructions to test the endpoints, and database.

1. **Regist A User**

```bash

curl -X POST http://localhost:4000/users/register \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "password": "testpassword"}'
```
```bash
# for windows cmd
curl -X POST http://localhost:4000/users/register -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"password\": \"testpassword\"}"
```

Prueba el registro con formato JSON correcto (evita problemas de comillas en Windows):

```bash

bash
Copy
curl -X POST http://localhost:4000/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"testuser2\", \"password\": \"Testpass123!\"}"
  ```

Example Response:

```json

{
  "id": 1,
  "username": "testuser"
}
```
This creates a user with the username testuser and password testpassword.

2. **Log In to Get a JWT Token**

Now that the user is registered, you can log in to get a JWT token.

Login Command:
```bash
curl -X POST http://localhost:4000/auth/login \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "password": "testpassword"}'
```

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

3. **Call the Protected Endpoint**
Use the access_token to call the protected GET /data endpoint.

Example Command:
```bash
curl -X GET "http://localhost:4000/data?startYear=2020&transportType=Autobús" \
-H "Authorization: Bearer <your_access_token>"
```

```bash
# for windows cmd
curl -X GET "http://localhost:4000/data?startYear=2020&transportType=Autobús" -H "Authorization: Bearer <your_access_token>"
```

Replace <your_access_token> with the token you obtained in Step 2.

> [!IMPORTANT]
> Fix for Windows Command Prompt, you need to:
> 1. Use double quotes (") for the JSON string.
> 2. Escape the double quotes inside the JSON using a backslash (\).


> [!WARNING]
> JWT tokens are time-limited and will expire after a certain 
> period. This is a security feature to ensure that tokens are 
> not valid indefinitely. When a token expires, you will need 
> to log in again to obtain a new token.

### Check the Database

1. Connect to your PostgreSQL database using a tool like psql, pgAdmin, or any database client.

2. Run the following query to check if the user exists:

```sql
SELECT * FROM "user" WHERE username = 'testuser';
```

- If no rows are returned, the user does not exist.

- If the user exists, verify that the password column contains a valid bcrypt hash.

### API Workflow
**Registration:**

1. User registers with username: testuser and password: testpassword.

2. Backend hashes the password and stores it in the database:

```plaintext
username: testuser
password: $2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUV
```

**Login:**

1. User logs in with username: testuser and password: testpassword.

2. Backend retrieves the hashed password from the database and compares it with the provided password:

```typescript
const isPasswordValid = bcrypt.compareSync('testpassword', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUV');
```
3. If the passwords match, the user is authenticated.

**Final Thoughts**
- The user only needs to enter their plain text password during login.

- The system handles password hashing and comparison automatically.

- If the password is currently stored in plain text, hash it once and update the database.

### Sync Data (If Needed)
If the database is empty or doesn’t have the required data, sync the data from the external API.

You should get a JWT token before executing the `curl -X POST http://localhost:4000/data/sync` command because the /data/sync endpoint is protected by the AuthGuard('jwt'). This is because the AuthGuard('jwt') ensures that only authenticated users (with a valid JWT token) can access the endpoint.

Sync Command:
```bash

curl -X POST http://localhost:4000/data/sync
```
Expected Response:
```json
{
  "message": "Data synchronization completed"
}
```
After syncing, check the database again to ensure the data has been populated, conside that you need to be authenticated.

### Steps to Get a JWT Token and Sync Data
1. Register a User (If Not Already Registered)

If you haven’t already registered a user, do so first.

```bash
curl -X POST http://localhost:4000/users/register -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"password\": \"testpassword\"}"
```
Response:
```json
{
  "id": 1,
  "username": "testuser"
}
```

2. Log In to Get a JWT Token

Use the /auth/login endpoint to log in and obtain a JWT token.

```bash
curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"password\": \"testpassword\"}"
```
Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Copy the access_token value from the response. You’ll use it in the next step.

3. Sync Data

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

## Example Use Cases
Here are some examples of how to use the /data endpoint to retrieve different types of data:

1. Get All Data
URL: http://localhost:4000/data

Response: Returns all data in the database.

2. Filter by Year
URL: http://localhost:4000/data?startYear=2020

Response: Returns data for the year 2020 and later.

3. Filter by Transport Type
URL: http://localhost:4000/data?transportType=Autobús

Response: Returns data for the transport type Autobús.

4. Filter by Year and Transport Type
URL: http://localhost:4000/data?startYear=2020&transportType=Tren Eléctrico

Response: Returns data for the year 2020 and later, filtered by the transport type Tren Eléctrico.

5. Filter by Year Range
URL: http://localhost:4000/data?startYear=2020&endYear=2022

Response: Returns data for the years 2020 to 2022.

6. Filter by Month
URL: http://localhost:4000/data?startMonth=1&endMonth=6

Response: Returns data for months 1 to 6.

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository.

2. Create a new branch (git checkout -b feature/YourFeatureName).

3. Commit your changes (git commit -m 'Add some feature').

4. Push to the branch (git push origin feature/YourFeatureName).

5. Open a pull request.