<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="60" alt="NestJS Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://www.postgresql.org/" target="blank">
    <img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="60" alt="PostgreSQL Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://typeorm.io/" target="blank">
    <img src="https://avatars.githubusercontent.com/u/20165699?s=200&v=4" width="60" alt="TypeORM Logo" />
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

# Backend API for IIEG Transport Statistics (Dockerized)

A **NestJS-based** backend for extracting and managing transport statistics data from the **IIEG API**, stored in **PostgreSQL**.

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