import logging
import os
import shutil
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src.ai_agent import summarize_text
from src.pdf_reader import extract_text_from_pdf

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("web-summarizer")

app = FastAPI(title="AI PDF Summarizer Web")

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
async def serve_index(request: Request):
    """Rendert die Startseite."""
    return templates.TemplateResponse(request=request, name="index.html")


@app.post("/api/summarize")
async def summarize_pdf(file: UploadFile = File(...)):
    """Nimmt eine PDF-Datei entgegen, extrahiert den Text und fasst ihn via LLM zusammen."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Ungültiges Dateiformat. Bitte ausschließlich PDF-Dateien hochladen.",
        )

    temp_path = UPLOAD_DIR / file.filename

    try:
        # Datei sicher auf die Festplatte schreiben
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info("Datei empfangen: %s", file.filename)

        # 1. Text extrahieren (bestehendes Modul aus Projekt 1)
        raw_text = extract_text_from_pdf(temp_path)

        # 2. KI-Zusammenfassung anfordern (bestehendes Modul aus Projekt 1)
        summary = summarize_text(raw_text)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "filename": file.filename,
                "summary": summary,
            },
        )

    except ValueError as e:
        logger.warning("Validierungsfehler bei %s: %s", file.filename, e)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error("Unerwarteter Serverfehler bei %s: %s", file.filename, e)
        raise HTTPException(
            status_code=500,
            detail=f"Interner Serverfehler: {str(e)}",
        )
    finally:
        # Upload-Ordner sauber halten: Datei nach Verarbeitung direkt löschen
        if temp_path.exists():
            temp_path.unlink()