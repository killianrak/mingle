FROM python:latest

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y ffmpeg

COPY . .

RUN 

EXPOSE 8000

CMD ["uvicorn", "app:app","--host", "0.0.0.0", "--port", "8000"]


