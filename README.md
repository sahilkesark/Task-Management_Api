# TaskFlow

Full-stack task management app: FastAPI + PostgreSQL backend and a React (Vite) workspace UI.

## Local development

1. Create a Postgres database named `task_management`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `SECRET_KEY`.
3. Install and run the API:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The UI talks to `http://127.0.0.1:8000` by default. Override with `frontend/.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

API docs: `http://127.0.0.1:8000/docs`

## Docker

```bash
docker compose up --build
```

- App: `http://localhost`
- API: `http://localhost:8000`

Set `SECRET_KEY` and `VITE_API_URL` in the environment (or a `.env` file next to `docker-compose.yml`) before deploying.
