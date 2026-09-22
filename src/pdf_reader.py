import logging
from pathlib import Path
from pypdf import PdfReader
from pypdf.errors import PdfReadError, FileNotDecryptedError

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str | Path) -> str:
    """Extrahiert den gesamten Text aus einer PDF-Datei.

    Args:
        file_path: Pfad zur PDF-Datei.

    Returns:
        Extrahierter Text als String.

    Raises:
        FileNotFoundError: Datei existiert nicht.
        ValueError: Datei ist verschlüsselt, beschädigt oder enthält keinen Text.
    """
    path = Path(file_path)
    if not path.is_file():
        logger.error("Datei nicht gefunden: %s", path)
        raise FileNotFoundError(f"Die Datei existiert nicht: {path}")

    logger.info("Starte Textextraktion für: %s", path.name)

    try:
        reader = PdfReader(str(path))

        if reader.is_encrypted:
            logger.warning("PDF ist passwortgeschützt: %s", path.name)
            raise ValueError(f"Die Datei '{path.name}' ist passwortgeschützt.")

        pages_text: list[str] = []
        for index, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_text.append(text)

        full_text = "\n".join(pages_text).strip()

        if not full_text:
            logger.warning("Kein Textinhalt extrahierbar: %s", path.name)
            raise ValueError(
                f"Die PDF '{path.name}' enthält keinen lesbaren Text (evtl. ein reines Bild/Scan)."
            )

        logger.info(
            "Extraktion erfolgreich (%d Seiten, %d Zeichen).",
            len(reader.pages),
            len(full_text),
        )
        return full_text

    except (PdfReadError, FileNotDecryptedError) as err:
        logger.error("PDF-Parsing-Fehler bei %s: %s", path.name, err)
        raise ValueError(f"Die Datei '{path.name}' ist beschädigt oder unlesbar.") from err