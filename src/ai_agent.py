import logging
import os
from dotenv import load_dotenv
from groq import Groq, APIConnectionError, RateLimitError, APIStatusError

load_dotenv()
logger = logging.getLogger(__name__)


def summarize_text(text: str) -> str:
    """Sendet Text an Groq LLM und gibt die Zusammenfassung zurück.

    Args:
        text: Der zu verarbeitende Fließtext.

    Returns:
        Strukturierte Zusammenfassung.

    Raises:
        ValueError: Fehlender API-Key oder leerer Input-Text.
        RuntimeError: API- oder Netzwerkfehler.
    """
    if not text.strip():
        raise ValueError("Der übergebene Text ist leer.")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.critical("GROQ_API_KEY nicht in .env gefunden.")
        raise ValueError(
            "GROQ_API_KEY fehlt! Bitte trage deinen API-Schlüssel in die .env-Datei ein."
        )

    logger.info("Initialisiere Groq-Client und starte LLM-Inferenz...")
    client = Groq(api_key=api_key)

    system_prompt = (
        "Du bist ein präziser Assistent. Fasse das gegebene Dokument "
        "strukturiert in Stichpunkten zusammen. Hebe Kernideen und "
        "wichtige Takeaways klar hervor."
    )

    try:
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            temperature=0.2,
        )
        summary = response.choices[0].message.content or ""
        logger.info("Inferenz erfolgreich abgeschlossen.")
        return summary

    except RateLimitError as err:
        logger.error("Groq Rate-Limit erreicht: %s", err)
        raise RuntimeError("API-Anfragelimit erreicht. Bitte kurz warten.") from err

    except APIConnectionError as err:
        logger.error("Netzwerkfehler zur Groq-API: %s", err)
        raise RuntimeError("Verbindung zur KI-API fehlgeschlagen. Internetverbindung prüfen.") from err

    except APIStatusError as err:
        logger.error("Groq API-Statusfehler: %s", err)
        raise RuntimeError(f"API-Fehler ({err.status_code}): {err.message}") from err