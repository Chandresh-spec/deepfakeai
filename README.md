# 🛡️ Explainable Multimodal Deepfake & Media Forensics Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Celery](https://img.shields.io/badge/Celery-5.4+-37814A.svg?style=flat&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT%20%2F%20Research-blue.svg)](LICENSE)

An end-to-end, enterprise-grade AI web application designed for **deepfake detection**, **multimedia forensic analysis**, and **explainable AI (XAI)**. This platform empowers digital forensic investigators, cybersecurity analysts, and journalists to upload digital media (images, audio, video) and obtain comprehensive authenticity reports backed by multi-layered forensic algorithms and external AI detection providers.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Detailed Environment Variables (`.env`)](#-detailed-environment-variables-env)
  - [Root `.env` Configuration](#root-env-configuration)
  - [Detection Provider Guide & API Keys](#detection-provider-guide--api-keys)
  - [Variable Reference Table](#variable-reference-table)
- [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
  - [Prerequisites](#prerequisites)
  - [Option A: One-Command Docker Setup (Recommended)](#option-a-one-command-docker-setup-recommended)
  - [Option B: Manual Local Development Setup](#option-b-manual-local-development-setup)
    - [1. Clone Repository](#1-clone-repository)
    - [2. Database & Redis Setup](#2-database--redis-setup)
    - [3. Backend Setup (FastAPI + Celery)](#3-backend-setup-fastapi--celery)
    - [4. Frontend Setup (React + Vite)](#4-frontend-setup-react--vite)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security & Best Practices](#-security--best-practices)
- [License](#-license)

---

## 🏛️ Overview & Architecture

Modern synthetic media tools (GANs, diffusion models, voice cloners) make visual and auditory tampering indistinguishable to the naked eye. This platform addresses this challenge not only by calculating a manipulation probability score, but also by providing **explainable forensic evidence** (frequency domain anomalies, compression artifacts, metadata tampering, and audio pitch irregularities).

```
┌─────────────────────────────────────────────────────────────┐
│                    React 18 Frontend                        │
│   (Investigation Workstation, Heatmap Overlays, Audio Viz)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Gateway                         │
│     (JWT Auth, Media Ingestion, Validation, Rate Limits)    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
     ┌──────────────────┐            ┌──────────────────┐
     │  PostgreSQL 16   │            │   Redis Queue    │
     │  (Metadata, Logs,│            │  (Celery Broker) │
     │   Cases, Results)│            └─────────┬────────┘
     └──────────────────┘                      │
                                               ▼
                              ┌────────────────────────────────┐
                              │     Celery Async Workers       │
                              ├────────────────────────────────┤
                              │ • Error Level Analysis (ELA)   │
                              │ • 2D FFT Frequency Analysis    │
                              │ • EXIF & Metadata Extraction   │
                              │ • Audio Forensics & Pitch Viz  │
                              │ • AI Detection Provider Client │
                              │ • PDF Report Generation        │
                              └────────────────────────────────┘
```

---

## ✨ Key Features

- 🔍 **Multimodal Deepfake Detection**: Supports Image (`.jpg`, `.png`, `.webp`), Audio (`.wav`, `.mp3`), and Video (`.mp4`, `.avi`, `.mov`) inputs.
- 🧩 **Pluggable Detection Providers**:
  - `demo`: Offline mock provider with deterministic synthetic outputs for development.
  - `sightengine`: SightEngine API for image and video deepfake/AI generation detection.
  - `realitydefender`: Reality Defender API for enterprise video and multimodal deepfake analysis.
  - `resemble`: Resemble AI Detect for synthesized speech and voice cloning detection.
- 🔬 **Explainable AI (XAI) & Forensics Suite**:
  - **Error Level Analysis (ELA)**: Identifies variations in JPEG compression levels across image regions.
  - **2D Fast Fourier Transform (FFT)**: Pinpoints high-frequency artifacts characteristic of GAN/diffusion generators.
  - **Audio Pitch & Spectrogram Analysis**: Visualizes synthetic acoustic discontinuities and pitch flattening.
  - **Metadata & Forensic Hashes**: Automatically computes cryptographic hashes (MD5, SHA-256) and parses EXIF metadata.
- 🖥️ **Interactive Investigation Workstation**: Dark-themed forensic interface with side-by-side comparisons, frame navigation, interactive charts, and evidence audit trails.
- ⚡ **Asynchronous Background Processing**: High-throughput processing powered by Celery workers and Redis.
- 📄 **Forensic PDF Reports**: Export verifiable audit reports with cryptographic hashes and visual evidence.
- 🔒 **Enterprise Security**: JWT-based session authorization, bcrypt password hashing, CORS protection, and sandboxed storage.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Modern, high-performance UI framework |
| **Styling** | Tailwind CSS, Lucide Icons | Responsive forensic workstation styling |
| **Charts** | Recharts, Canvas API | Real-time spectral and confidence visualizations |
| **Backend** | Python 3.10+, FastAPI | High-throughput async REST API |
| **ORM & Migrations**| SQLAlchemy 2.0, Alembic | Type-safe database mapping and version control |
| **Database** | PostgreSQL 16 | Relational storage for users, media, and analyses |
| **Task Queue** | Celery 5.4, Redis 7 | Distributed async worker queue |
| **Computer Vision**| OpenCV (`cv2`), Pillow, NumPy | Image processing, ELA, FFT, frame extraction |
| **Audio Processing**| Librosa, SoundFile, SciPy | Audio feature extraction and waveform analysis |
| **PDF Generation** | ReportLab | Automated forensic documentation |
| **Containerization**| Docker, Docker Compose | Multi-container reproducible runtime |

---

## 📁 Project Structure

```
├── backend/
│   ├── alembic/                  # Database migration scripts
│   ├── app/
│   │   ├── api/v1/               # FastAPI route handlers
│   │   │   ├── endpoints/        # Auth, Media, and Analysis routes
│   │   │   └── router.py         # Primary API v1 router
│   │   ├── core/                 # App configuration, DB session, JWT security
│   │   ├── detection/            # AI Provider abstraction (Demo, SightEngine, Reality Defender, Resemble)
│   │   ├── forensics/            # Forensic algorithms (ELA, FFT, EXIF, Hashing)
│   │   ├── models/               # SQLAlchemy ORM models (User, Media, Analysis)
│   │   ├── reports/              # PDF report generator (ReportLab)
│   │   ├── schemas/              # Pydantic validation models
│   │   ├── services/             # Core business logic
│   │   ├── storage/              # Local / cloud storage management
│   │   ├── workers/              # Celery task definitions
│   │   └── xai/                  # Explainability algorithms & visualizers
│   ├── tests/                    # Unit and integration tests
│   ├── Dockerfile                # Backend container definition
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI widgets, charts, and loaders
│   │   ├── hooks/                # Custom React state and query hooks
│   │   ├── pages/                # Landing, Login, Register, Dashboard, Case Investigation
│   │   ├── services/             # Axios API client bindings
│   │   └── types/                # TypeScript type declarations
│   ├── Dockerfile                # Frontend Nginx container definition
│   ├── package.json              # Node.js dependencies and scripts
│   └── vite.config.ts            # Vite configuration
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git exclusion rules
└── README.md                     # Platform documentation
```

---

## ⚙️ Detailed Environment Variables (`.env`)

The platform uses environment variables to configure database connections, caching, security keys, and third-party AI detection providers.

> [!IMPORTANT]
> Never commit `.env` files containing real secrets to GitHub. Keep `.env` gitignored and copy from `.env.example`.

### Root `.env` Configuration

To start, copy the root `.env.example` to `.env`:

```bash
cp .env.example .env      # Linux / macOS
copy .env.example .env    # Windows PowerShell / CMD
```

Here is the complete reference for all variables:

```dotenv
# ==============================================================================
# Explainable Multimodal Deepfake & Media Forensics Platform
# Environment Configuration
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. APPLICATION SETTINGS
# ------------------------------------------------------------------------------
APP_NAME="Explainable Multimodal Deepfake & Media Forensics Platform"
APP_VERSION=0.1.0
DEBUG=true

# ------------------------------------------------------------------------------
# 2. POSTGRESQL DATABASE
# ------------------------------------------------------------------------------
# Container configuration
POSTGRES_DB=deepfake
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# SQLAlchemy Connection String:
# In Docker:    postgresql://postgres:postgres@postgres:5432/deepfake
# Local Native: postgresql://postgres:postgres@localhost:5432/deepfake
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/deepfake

# ------------------------------------------------------------------------------
# 3. REDIS & TASK QUEUE
# ------------------------------------------------------------------------------
# Redis connection URL (Celery broker & backend)
# In Docker:    redis://redis:6379/0
# Local Native: redis://localhost:6379/0
REDIS_URL=redis://redis:6379/0

# ------------------------------------------------------------------------------
# 4. JWT AUTHENTICATION & SECURITY
# ------------------------------------------------------------------------------
# Secret key used for signing JWT tokens (generate via `openssl rand -hex 32`)
JWT_SECRET=change-me-to-a-secure-random-secret-key-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# ------------------------------------------------------------------------------
# 5. DETECTION PROVIDER CONFIGURATION
# ------------------------------------------------------------------------------
# Options: "demo", "sightengine", "realitydefender", "resemble"
DETECTION_PROVIDER=demo

# SightEngine API (Required if DETECTION_PROVIDER=sightengine)
# Get from: https://sightengine.com
SIGHTENGINE_API_USER=
SIGHTENGINE_API_SECRET=

# Resemble AI API (Required if DETECTION_PROVIDER=resemble)
# Get from: https://www.resemble.ai/detect/
RESEMBLE_API_KEY=

# Reality Defender API (Required if DETECTION_PROVIDER=realitydefender)
# Get from: https://www.realitydefender.com
REALITY_DEFENDER_API_KEY=

# ------------------------------------------------------------------------------
# 6. CORS & NETWORKING
# ------------------------------------------------------------------------------
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# ------------------------------------------------------------------------------
# 7. FILE STORAGE & UPLOAD LIMITS
# ------------------------------------------------------------------------------
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=500

# ------------------------------------------------------------------------------
# 8. FRONTEND CLIENT
# ------------------------------------------------------------------------------
VITE_API_URL=http://localhost:8000/api/v1
```

### Detection Provider Guide & API Keys

| Provider | `DETECTION_PROVIDER` | Best For | How to Obtain API Keys |
|---|---|---|---|
| **Demo Mode** | `demo` | Local dev, offline testing, CI | **No API keys needed**. Returns realistic deterministic synthetic forensic outputs. |
| **SightEngine** | `sightengine` | Image & Video deepfakes | 1. Sign up at [sightengine.com](https://sightengine.com)<br>2. Copy **API User** and **API Secret** into `SIGHTENGINE_API_USER` & `SIGHTENGINE_API_SECRET`. |
| **Resemble AI** | `resemble` | Audio deepfake & voice cloning | 1. Sign up at [resemble.ai](https://www.resemble.ai)<br>2. Navigate to API Keys and copy into `RESEMBLE_API_KEY`. |
| **Reality Defender** | `realitydefender` | Video & Multimodal deepfake detection | 1. Contact [realitydefender.com](https://www.realitydefender.com)<br>2. Insert your provisioned key into `REALITY_DEFENDER_API_KEY`. |

### Variable Reference Table

| Variable | Type | Default | Description |
|---|---|---|---|
| `POSTGRES_DB` | `str` | `deepfake` | PostgreSQL database name |
| `POSTGRES_USER` | `str` | `postgres` | PostgreSQL root user |
| `POSTGRES_PASSWORD` | `str` | `postgres` | PostgreSQL password |
| `DATABASE_URL` | `str` | `postgresql://...` | Full SQLAlchemy async/sync connection URL |
| `REDIS_URL` | `str` | `redis://...` | Connection URI for Redis broker |
| `JWT_SECRET` | `str` | `change-me-...` | Cryptographic secret for signing tokens |
| `JWT_ALGORITHM` | `str` | `HS256` | JWT signing algorithm |
| `JWT_EXPIRATION_MINUTES` | `int` | `60` | Token lifetime before re-authentication |
| `DETECTION_PROVIDER` | `str` | `demo` | AI provider selector (`demo`, `sightengine`, etc.) |
| `ALLOWED_ORIGINS` | `json` | `["http://..."]` | Allowed CORS origins for the frontend |
| `UPLOAD_DIR` | `str` | `/app/uploads` | Path for raw files, frames, and heatmaps |
| `MAX_UPLOAD_SIZE_MB` | `int` | `500` | Maximum media file upload size (MB) |
| `VITE_API_URL` | `str` | `http://...` | Base API URL configured in frontend |

---

## 🚀 Step-by-Step Setup Guide

### Prerequisites

Ensure you have the following installed on your machine:
- **Docker Desktop** (version 24.0+ and Docker Compose v2)
- **Node.js** (v18.0+) & `npm` (for local frontend dev)
- **Python** (v3.10+) & `pip` (for local backend dev)
- **Git**

---

### Option A: One-Command Docker Setup (Recommended)

Docker Compose provisions PostgreSQL, Redis, FastAPI, Celery worker, and React with Nginx in a unified network.

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Chandresh-spec/deepfakeai.git
cd deepfakeai
```

#### Step 2: Configure Environment Variables
```bash
# Copy template to .env
cp .env.example .env
```
*(Optional: Open `.env` and configure your API keys or leave `DETECTION_PROVIDER=demo` for instant testing).*

#### Step 3: Build & Start Containers
```bash
docker compose up --build -d
```

#### Step 4: Verify Running Services
```bash
docker compose ps
```

All 5 services should show as `healthy` or `running`:
- `postgres`: Port 5432
- `redis`: Port 6379
- `backend`: Port 8000
- `worker`: Celery task worker
- `frontend`: Port 3000

#### Step 5: Access the Platform
- 🌐 **Web Application**: [http://localhost:3000](http://localhost:3000)
- 📚 **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

To view real-time logs:
```bash
docker compose logs -f
```

To stop containers:
```bash
docker compose down
```

---

### Option B: Manual Local Development Setup

If you prefer to run services natively without Docker containers:

#### 1. Clone Repository
```bash
git clone https://github.com/Chandresh-spec/deepfakeai.git
cd deepfakeai
```

#### 2. Database & Redis Setup
Ensure you have **PostgreSQL** running on port 5432 and **Redis** on port 6379:
```bash
# Create database in PostgreSQL
createdb -U postgres deepfake
```

#### 3. Backend Setup (FastAPI + Celery)

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv

# Activate venv:
# On Windows:
venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure backend environment
copy .env.example .env       # Windows
cp .env.example .env         # Linux / macOS
```

> **Note for Local Backend `.env`**: Make sure `DATABASE_URL` is set to `localhost`:
> `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deepfake`
> `REDIS_URL=redis://localhost:6379/0`

```bash
# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 4. Start Celery Background Worker
Open a **new terminal tab** in the `backend` directory with the virtual environment activated:

```bash
# On Linux / macOS:
celery -A app.workers.celery_app worker --loglevel=info

# On Windows (use solo pool for local development):
celery -A app.workers.celery_app worker --loglevel=info -P solo
```

#### 5. Frontend Setup (React + Vite)
Open another terminal tab:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📡 API Documentation & Endpoints

FastAPI provides interactive OpenAPI documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core Endpoints

| Category | Method | Endpoint | Description | Auth Required |
|---|---|---|---|:---:|
| **Health** | `GET` | `/api/v1/health` | Service health status check | No |
| **Auth** | `POST` | `/api/v1/auth/register` | Register a new forensic investigator account | No |
| **Auth** | `POST` | `/api/v1/auth/login` | Login and receive a JWT Bearer token | No |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| **Media** | `POST` | `/api/v1/media/upload` | Upload image, video, or audio file | Yes |
| **Media** | `GET` | `/api/v1/media/{media_id}` | Retrieve uploaded media metadata | Yes |
| **Analysis** | `POST` | `/api/v1/analysis/{media_id}` | Trigger asynchronous deepfake & forensic analysis | Yes |
| **Analysis** | `GET` | `/api/v1/analysis/{analysis_id}` | Fetch analysis status, scores, and findings | Yes |
| **XAI** | `GET` | `/api/v1/analysis/{analysis_id}/xai` | Get explainable heatmaps and forensic artifacts | Yes |
| **Reports** | `GET` | `/api/v1/analysis/{analysis_id}/report` | Download official PDF Forensic Case Report | Yes |

---

## 🧪 Testing & Quality Assurance

### Running Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Running Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 🔒 Security & Best Practices

1. **Keep Secrets Secure**: Never commit `.env` files with production secrets or vendor API keys.
2. **Rotate JWT Secrets**: Generate a cryptographic 256-bit string in production using `openssl rand -hex 32`.
3. **Storage Sanitization**: File uploads are scanned for valid MIME types and assigned non-predictable UUIDs to prevent directory traversal and arbitrary execution.
4. **CORS Isolation**: Restrict `ALLOWED_ORIGINS` to verified production domains when deploying live.

---

## 📄 License

Distributed under the MIT / Academic Research License. See `LICENSE` for details.
