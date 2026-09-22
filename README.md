# 📄 AI PDF Summarizer (FastAPI Web App)

Ein asynchrones Full-Stack-Web-Tool zur automatisierten Analyse und Verdichtung mehrseitiger PDF-Dokumente mittels lokaler Textextraktion ( pypdf ) und Cloud-LLM-Inferenz (Qwen 3.8 via Groq).

Die Anwendung nutzt eine entkoppelte Client-Server-Architektur: Ein performantes FastAPI-Backend bedient ein reaktives Vanilla-JavaScript-Frontend mit asynchroner Datenübertragung, Drag-and-Drop-Upload und unterbrechungsfreier Benutzerführung ohne schwergewichtige Frontend-Frameworks.

---

## ✨ Features

* Non-blocking Async Architecture: Vollständig asynchrone Request-Verarbeitung via FastAPI (async / await) für blockierungsfreie I/O-Vorgänge beim Datei-Upload und API-Routing.
* Drag-and-Drop & Reaktives UI: Intuitives Upload-Interface mit Dateivalidierung im Browser, animiertem Ladeindikator und One-Click-Clipboard-Kopierfunktion.
* Automatisches Dokumenten-Parsing: Schnelle Extraktion von Plain-Text aus mehrseitigen PDFs mittels modularer pypdf-Pipeline.
* High-Speed KI-Inferenz: Direkte Anbindung an die Groq-Cloud-API ( qwen/qwen3.8-27b ) für strukturierte Zusammenfassungen in Sekundenschnelle.
* Enterprise Error Handling: Dediziertes Abfangen von ungültigen Dateiformaten, Scans ohne Textschicht, fehlenden API-Schlüsseln und API-Rate-Limits mit semantischen HTTP-Statuscodes (400, 422, 500, 502).
* Automatisches Ressourcenmanagement: Sichere temporäre Dateispeicherung im Dateisystem mit deterministischer Bereinigung im finally-Block nach Abschluss des Requests.
* Standardisiertes Logging: Vollständige Protokollierung aller Prozessschritte über Pythons internes logging-Modul mit Zeitstempeln und Loglevels ( INFO , WARNING , ERROR ).
* Saubere Architektur: Strikte Trennung von Datenaustausch ( app.py ), PDF-Extraktion ( src/pdf_reader.py ) und KI-Prompt-Logik ( src/ai_agent.py ).
* Sicherheitsstandard: Schutz sensibler API-Keys über .env und .gitignore.

---

## 🛠 Tech Stack & Tooling

* Sprache: Python 3 (Typisiert mit Type Hints)
* Web-Framework & Server: FastAPI, Uvicorn (ASGI), Jinja2
* Frontend: HTML5, Vanilla CSS3 (Modern Dark Theme), Modern Vanilla JavaScript (Fetch API)
* PDF Engine: pypdf
* LLM / API: groq SDK ( qwen/qwen3.8-27b )
* Environment: python-dotenv
* Lizenz: MIT License

---

## 📁 Projektstruktur

ai-pdf-summarizer-web/
├── static/
│   ├── css/
│   │   └── style.css          # Modernes Responsive Dark-Design
│   └── js/
│       └── app.js             # Client-Logik, Drag & Drop, Async Fetch
├── templates/
│   └── index.html             # Jinja2 HTML-Template
├── src/
│   ├── __init__.py            # Paket-Initialisierung
│   ├── ai_agent.py            # LLM-Orchestrierung & Error-Handling
│   └── pdf_reader.py          # PDF-Parsing & Validierung
├── uploads/
│   └── .gitkeep               # Temporärer Speicherort für File-Streaming
├── .env.example               # Konfigurationsvorlage für Umgebungsvariablen
├── .gitignore                 # Ignoriert virtuelle Umgebung, Cache & .env
├── app.py                     # FastAPI-Applikation, Endpoints & Dispatching
├── LICENSE                    # MIT-Lizenz
├── README.md                  # Projektdokumentation
└── requirements.txt           # Abhängigkeiten für den Produktionsbetrieb

---

## 🚀 Schnelleinrichtung & Start

Folge diesen Schritten im Terminal, um das Projekt lokal auszuführen:

1. Repository klonen:
git clone https://github.com/EnverAktuerk945/ai-pdf-summarizer-web.git
cd ai-pdf-summarizer-web

2. Virtuelle Umgebung erstellen und aktivieren:
python3 -m venv .venv
source .venv/bin/activate

3. Abhängigkeiten installieren:
python3 -m pip install -r requirements.txt

4. API-Schlüssel hinterlegen: Erstelle deine .env-Datei anhand der Vorlage:
cp .env.example .env

Öffne .env und trage deinen Groq-API-Key ein:
GROQ_API_KEY=gsk_dein_api_schluessel_hier

• Wie erstelle ich einen kostenlosen Groq API Key?
  i. Öffne die Groq Console (https://console.groq.com/) und erstelle ein kostenloses Konto.
  ii. Klicke im Menü links auf API Keys (oder direkt https://console.groq.com/keys).
  iii. Klicke auf Create API Key, vergib einen beliebigen Namen (z. B. pdf-summarizer-web) und kopiere den Schlüssel.

5. Web-Server starten:
uvicorn app:app --port 8000 --reload

Öffne deinen Browser unter:
http://127.0.0.1:8000

• Schritt-für-Schritt: So bedienst du die Web-App:
  i. Nach dem Aufruf der URL siehst du eine aufgeräumte Dark-Mode-Oberfläche mit einer gestrichelten Upload-Box ("PDF hierher ziehen oder durchsuchen").
  ii. Dokument auswählen: Ziehe eine beliebige PDF-Datei per Drag-and-Drop direkt in das Feld oder klicke darauf, um deinen Dateimanager zu öffnen und eine PDF auszuwählen.
  iii. Bestätigen: Der Dateiname sowie die Dateigröße werden sofort grün/grau angezeigt und der Button "Zusammenfassen" wird freigeschaltet.
  iv. Generieren: Klicke auf "Zusammenfassen". Ein Lade-Spinner signalisiert die asynchrone Textextraktion und KI-Inferenz.
  v. Ergebnis nutzen: Nach wenigen Sekunden erscheint die strukturierte Zusammenfassung direkt darunter. Über den Button "Kopieren" oben rechts wird der gesamte Text mit einem Klick in deine Zwischenablage kopiert.

• Häufige Probleme & Lösungen (Troubleshooting):
  - Fehler "Address already in use" (Port 8000 belegt):
    Falls der Port blockiert ist, beende bestehende Prozesse im Terminal mit:
    pkill -f uvicorn
    Oder starte den Server alternativ auf einem anderen Port (z. B. 8080):
    uvicorn app:app --port 8080 --reload
  - Browser lädt ewig:
    Achte darauf, direkt "http://127.0.0.1:8000" in die Adresszeile einzugeben (nicht "about:blank" oder reine Websuchen).

---

## ⚖️ Lizenz

Dieses Projekt ist unter der MIT License lizenziert.