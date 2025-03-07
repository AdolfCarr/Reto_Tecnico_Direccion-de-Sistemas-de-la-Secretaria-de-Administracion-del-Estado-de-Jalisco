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

1. Run the backend with Docker

From the backend project's root directory (where docker-compose.yml is located):

```bash
docker-compose up --build
```
Verify that both services are running:

```bash
docker ps
```

You should see two active containers:

- transporte-db (PostgreSQL)
- transporte-back (Backend NestJS)

```bash
 STATUS                 NAMES
 Up 5 hours             transporte-db  
 Up 5 hours             transporte-back
 ```

2. Verify functionality

Test user registration with a correctly formatted JSON request (avoiding quotation issues in Windows):

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
Verify the users table:

```sql
SELECT * FROM "user";
```
Check if the test user is registered:

```sql
SELECT FROM "user" WHERE username = 'testuser';
```

## Build up the Angular server

If the backend works as spected, then continue to the local build up of the Angular server.

1. **Verifica tu versión de Angular**
This frontend was developed with Angular CLI: 19.2.0. Older versions might not work properly.

```bash
ng version
```

2. **Ejecuta el frontend**

Ensure the backend is running at http://localhost:4000, then:

```bash
ng serve
```

3. **Access the Application**

Open a browser and go to:

```html
http://localhost:4200/
```

Register a new user or log in with the previously created test user.

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
# Rebuild containers
docker-compose build --no-cache
# Start the system
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

### Final Verification  Steps

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

1. The user enters their details in the registration form:

   - The user provides information such as username, password, and any other required data (e.g., email).

2. The frontend sends the data to the backend:

   - The registration form calls the register() method of the AuthService.

   - An HTTP POST request is sent to the /users/register endpoint of the backend.

3. The backend processes the registration request:

   - The backend receives the user's data.

   - It validates that the data is correct (e.g., checks if the username is already in use).

   - It hashes the password using a secure algorithm (e.g., bcrypt).

4. The backend stores the user in the PostgreSQL database:

   - The backend executes an SQL query to insert the new user into the users table of the PostgreSQL database.

   - The password is stored as a hash, not in plain text.

5. The backend responds to the frontend:

   - If the registration is successful, the backend returns a success response (e.g., a message or a 201 status code).

   - If there is an error (e.g., the username already exists), the backend returns an error message.

6. The frontend handles the response:

   - If the registration is successful, the frontend redirects the user to the login page.

   - If there is an error, the frontend displays an error message to the user.

#### Login:

1. The user enters their credentials:

   - The user types their username and password into the login form.

2. The frontend sends the credentials to the backend:

   - The login form calls the login() method of the AuthService.

   - An HTTP POST request is sent to the /auth/login endpoint of the backend.

3. The backend validates the credentials:

   - The backend checks if the user exists and if the password is correct.

   - If the credentials are valid, the backend generates a JWT (JSON Web Token) and returns it to the frontend.

4. The frontend stores the token:

   - The frontend receives the token and saves it in localStorage or sessionStorage.

   - The token is used to authenticate future requests to the backend.

5. The frontend redirects the user to the dashboard:
   - After a successful login, the user is redirected to the dashboard page (or any other protected route).

#### Logout:

1. The user clicks the logout button:

   - The logout button calls the logout() method of the AuthService.

2. The frontend deletes the token:

   - The token is removed from localStorage or sessionStorage.

3. The frontend redirects the user to the login page:

   - After deleting the token, the user is redirected to the login page.

4. The backend invalidates the token (optional):

   - If the backend has a token invalidation system, the frontend can send a request to invalidate the current token.

**Final Thoughts**

- The user only needs to enter their plain-text password during login.

- The system handles password hashing and comparison automatically.

- If the password is currently stored in plain text, hash it once and update the database.

