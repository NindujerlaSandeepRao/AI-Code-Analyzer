# AI Code Analyzer

A full-stack application that analyzes source code files for quality issues, generates an AI-powered review using a local large language model, and persists results — all containerized with Docker Compose.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Docker Services](#docker-services)
- [Score Interpretation](#score-interpretation)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Axios |
| Backend | Spring Boot 3.5, Java 17 |
| AI Engine | Ollama, TinyLlama (local LLM) |
| Object Storage | MinIO |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

---

## Features

- Upload `.java`, `.py`, `.js`, and `.txt` files via drag and drop or file browser
- Static analysis detecting TODO comments, overly long lines, and oversized files
- AI-powered code review via a locally running TinyLlama model with no external API dependency
- Animated score ring with color-coded quality rating
- Dedicated AI Insights section, visually separated from rule-based issue detection
- File storage backed by MinIO object storage
- Analysis history persisted to PostgreSQL and queryable via REST
- Fully containerized — all services start with a single `docker-compose up` command

---

## Project Structure

```
AsyncCodeAnalyzer/
├── backend-application/
│   ├── src/main/java/com/codeanalyzer/
│   │   ├── controller/
│   │   │   ├── CodeAnalyzerController.java     # POST /analyze
│   │   │   └── HistoryController.java          # GET /history
│   │   ├── service/
│   │   │   ├── CodeAnalyzerService.java        # Core analysis logic
│   │   │   └── AiAnalysisService.java          # Ollama LLM integration
│   │   ├── entity/
│   │   │   └── AnalysisHistory.java            # JPA entity
│   │   ├── repository/
│   │   │   └── AnalysisHistoryRepository.java
│   │   └── config/
│   │       └── MinioConfig.java                # MinIO client and bucket setup
│   ├── src/main/resources/
│   │   └── application.properties
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   └── ResultCard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Java 17 and Maven (for building the backend JAR)
- Node.js 18 or later (for running the frontend locally)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AsyncCodeAnalyzer.git
cd AsyncCodeAnalyzer
```

### 2. Build the backend JAR

```bash
cd backend-application
mvn clean package -DskipTests
cd ..
```

### 3. Start all services

```bash
docker-compose up --build -d
```

This brings up PostgreSQL, MinIO, Ollama, and the Spring Boot backend.

### 4. Pull the TinyLlama model

This step is required on first run only. The download is approximately 637 MB.

```bash
docker exec -it ollama ollama pull tinyllama
```

Wait for the pull to complete before uploading files, otherwise AI analysis will return unavailable.

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

---

## API Reference

### POST /analyze

Accepts a source code file and returns a quality analysis.

**Request**

```
Content-Type: multipart/form-data
Parameter:    file
```

**Response**

```json
{
  "fileName": "Main.java",
  "issues": [
    "Found TODO comment",
    "Too many lines (143)"
  ],
  "aiSuggestions": [
    "Consider extracting repeated logic into utility methods..."
  ],
  "score": 80
}
```

### GET /history

Returns all past analysis records stored in the database.

---

## Configuration

Backend configuration is managed in `backend-application/src/main/resources/application.properties`.

```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/code_review
spring.datasource.username=admin
spring.datasource.password=password123

minio.url=http://minio:9000
minio.access-key=admin
minio.secret-key=password123
minio.bucket=code-uploads
```

To point the frontend at a different backend URL, set the environment variable before building:

```bash
VITE_API_URL=https://your-api.com npm run build
```

---

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| backend | 8080 | Spring Boot REST API |
| postgres | 5432 | PostgreSQL database |
| minio | 9000 | Object storage API |
| minio-console | 9001 | MinIO web dashboard |
| ollama | 11434 | Local LLM inference server |

The MinIO dashboard is accessible at [http://localhost:9001](http://localhost:9001) using the credentials `admin` / `password123`. Uploaded files are stored in the `code-uploads` bucket.

---

## Score Interpretation

The quality score is calculated as `100 - (number of issues * 10)`, with a minimum of 0.

| Score | Rating | Description |
|-------|--------|-------------|
| 80 - 100 | Excellent | Clean, well-structured code |
| 60 - 79 | Good | Minor issues present |
| 40 - 59 | Fair | Several improvements needed |
| 0 - 39 | Poor | Significant issues detected |

---

## Troubleshooting

**AI Insights shows "AI not available"**

Confirm TinyLlama has been pulled into the Ollama container:

```bash
docker exec -it ollama ollama list
```

If the model is not listed, pull it:

```bash
docker exec -it ollama ollama pull tinyllama
```

**Backend fails to start**

Verify all containers are running:

```bash
docker ps
```

Inspect backend logs for specific errors:

```bash
docker logs code-analyzer-backend
```

**Frontend cannot reach the backend**

Confirm the backend container is bound to port 8080. All controllers are annotated with `@CrossOrigin("*")`, so CORS is not a likely cause.

---

## License

This project is licensed under the MIT License.
