document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("uploadForm");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const fileInfo = document.getElementById("fileInfo");
    const fileName = document.getElementById("fileName");
    const removeFileBtn = document.getElementById("removeFileBtn");
    const submitBtn = document.getElementById("submitBtn");
    const statusSection = document.getElementById("statusSection");
    const errorSection = document.getElementById("errorSection");
    const errorMessage = document.getElementById("errorMessage");
    const resultSection = document.getElementById("resultSection");
    const resultContent = document.getElementById("resultContent");
    const copyBtn = document.getElementById("copyBtn");

    let selectedFile = null;

    dropZone.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("drag-over");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("drag-over");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer ? e.dataTransfer.files : null;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });

    function handleFile(file) {
        hideError();
        resultSection.classList.add("hidden");

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            showError("Ungültiges Dateiformat. Bitte wähle eine PDF-Datei aus.");
            resetUI();
            return;
        }

        selectedFile = file;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        fileName.textContent = `${file.name} (${sizeMb} MB)`;

        dropZone.classList.add("hidden");
        fileInfo.classList.remove("hidden");
        submitBtn.disabled = false;
    }

    removeFileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        resetUI();
    });

    function resetUI() {
        selectedFile = null;
        fileInput.value = "";
        fileInfo.classList.add("hidden");
        dropZone.classList.remove("hidden");
        submitBtn.disabled = true;
    }

    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fileToSend = selectedFile || (fileInput.files ? fileInput.files[0] : null);
        if (!fileToSend) {
            showError("Bitte wähle zuerst eine PDF-Datei aus.");
            return;
        }

        hideError();
        submitBtn.disabled = true;
        statusSection.classList.remove("hidden");
        resultSection.classList.add("hidden");

        const formData = new FormData();
        formData.append("file", fileToSend);

        try {
            const response = await fetch("/api/summarize", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                let detailMsg = "Verarbeitungsfehler auf dem Server.";
                if (typeof data.detail === "string") {
                    detailMsg = data.detail;
                } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
                    detailMsg = data.detail[0].msg;
                }
                throw new Error(detailMsg);
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

    copyBtn.addEventListener("click", () => {
        if (!resultContent.textContent) return;

        navigator.clipboard.writeText(resultContent.textContent).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Kopiert!";
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorSection.classList.remove("hidden");
    }

    function hideError() {
        errorSection.classList.add("hidden");
        errorMessage.textContent = "";
    }
});