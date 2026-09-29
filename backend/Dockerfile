FROM python:3.12-slim

WORKDIR /app

# Required for psycopg2-binary
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

# Railway injects PORT env var; default to 5000 for local Docker runs
EXPOSE 5000

# Use gunicorn (production WSGI server), not Flask dev server.
# --timeout 120 handles TensorFlow's slow cold start.
CMD ["uv", "run", "gunicorn", "--bind", "0.0.0.0:${PORT:-5000}", "--timeout", "120", "--workers", "1", "run:app"]