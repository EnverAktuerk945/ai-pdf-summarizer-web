document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const fileInfo = document.getElementById("fileInfo");
    const fileName = document.getElementById("fileName");
    const removeFileBtn = document.getElementById("removeFileBtn");
    const submitBtn = document.getElementById("submitBtn");
    const uploadForm = document.getElementById("uploadForm");
    
    const statusSection = document.getElementById("statusSection");
    const errorSection = document.getElementById("errorSection");
    const errorMessage = document.getElementById("errorMessage");
    const resultSection = document.getElementById("resultSection");
    const resultContent = document.getElementById("resultContent");
    const copyBtn = document.getElementById("copyBtn");

    let selectedFile = null;

    // Klick auf Drag&Drop Zone öffnet Filepicker
    dropZone.addEventListener("click", () => fileInput.click());

    // Drag-Events
    ["dragenter", "dragover"].forEach(event => {
        dropZone.addEventListener(event, (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach(event => {
        dropZone.addEventListener(event, (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            showError("Nur PDF-Dateien sind zulässig.");
            return;
        }
        selectedFile = file;
        fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        fileInfo.classList.remove("hidden");
        dropZone.classList.add("hidden");
        submitBtn.disabled = false;
        hideError();
    }

    removeFileBtn.addEventListener("click", () => {
        selectedFile = null;
        fileInput.value = "";
        fileInfo.classList.add("hidden");
        dropZone.classList.remove("hidden");
        submitBtn.disabled = true;
    });

    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        hideError();
        resultSection.classList.add("hidden");
        statusSection.classList.remove("hidden");
        submitBtn.disabled = true;

        try {
            const response = await fetch("/api/summarize", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Verarbeitungsfehler aufgetreten.");
            }

            resultContent.textContent = data.summary;
            resultSection.classList.remove("hidden");
        } catch (err) {
            showError(err.message);
        } finally {
            statusSection.classList.add("hidden");
            submitBtn.disabled = false;
        }
    });

    copyBtn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(resultContent.textContent);
        copyBtn.textContent = "Kopiert!";
        setTimeout(() => (copyBtn.textContent = "Kopieren"), 2000);
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorSection.classList.remove("hidden");
    }

    function hideError() {
        errorSection.classList.add("hidden");
    }
});