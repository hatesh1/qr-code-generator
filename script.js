
// DOM elements
const inputElement = document.querySelector(".input-field");
const qrImage = document.querySelector(".img");
const qrBoxDiv = document.querySelector(".qr-box");
const generateButton = document.getElementById("generateBtn");
const downloadButton = document.getElementById("downloadBtn");

// Helper function to show SweetAlert toasts or alerts
function showWarningToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: '#fff',
        iconColor: '#e68a2e'
    });
    Toast.fire({
        icon: 'warning',
        title: message
    });
}

function showSuccessToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.style.borderLeft = '4px solid #2563eb';
        }
    });
    Toast.fire({
        icon: 'success',
        title: message
    });
    downloadButton.style.display = "inline-flex";
}

function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        confirmButtonColor: '#1e5a6f',
        background: '#ffffff',
        borderRadius: '1rem'
    });
}

// Core QR generation logic (professional)
function generateQRCode(event) {
    if (event) event.preventDefault();

    let rawValue = inputElement.value;
    if (!rawValue || rawValue.trim() === "") {
        showWarningToast("Please enter text or a URL before generating.");
        return;
    }

    generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateButton.style.opacity = "0.7";
    generateButton.style.pointerEvents = "none";

    let trimmedData = rawValue.trim();
    // encodeURIComponent for safety
    let qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(trimmedData)}&margin=10`;

    // Set image source
    qrImage.src = qrApiUrl;

    // When image loads, show qr box with active class, plus success toast
    qrImage.onload = () => {
        qrBoxDiv.classList.add("active");
        showSuccessToast("QR code generated successfully!");
        generateButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR';
        generateButton.style.opacity = "1";
        generateButton.style.pointerEvents = "auto";
    };

    // fallback if load fails
    qrImage.onerror = () => {
        qrBoxDiv.classList.remove("active");
        showErrorAlert("QR generation failed. Check your internet or try again.");
        generateButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR';
        generateButton.style.opacity = "1";
        generateButton.style.pointerEvents = "auto";
    };
}

// Professional download function (async with SweetAlert feedback)
async function downloadQR() {
    // Check if QR code is visible & image source is valid
    if (!qrBoxDiv.classList.contains("active") || !qrImage.src || qrImage.src === "" || qrImage.src.includes("undefined")) {
        showWarningToast("No QR code to download. Please generate a QR first.");
        return;
    }

    // We'll fetch the current image from the src
    const imageUrl = qrImage.src;
    if (!imageUrl.startsWith("http") && !imageUrl.startsWith("https")) {
        showErrorAlert("Invalid QR image source.");
        return;
    }

    // Show loading toast while fetching (optional)
    Swal.fire({
        title: 'Preparing download...',
        text: 'Processing your QR code',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Network response error");
        const blob = await response.blob();
        const downloadLink = document.createElement("a");
        const blobUrl = URL.createObjectURL(blob);
        downloadLink.href = blobUrl;
        // generate timestamp for unique file naming
        const timestamp = new Date().getTime();
        downloadLink.download = `QR_Code_${timestamp}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);

        Swal.close(); // close loading
        // Success toast via SweetAlert toast
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true,
        });
        Toast.fire({
            icon: 'success',
            title: 'Downloaded Successfully'
        });
    } catch (error) {
        Swal.close();
        console.error("Download failed", error);
        showErrorAlert("Download failed. Could not fetch QR image. Please try again.");
    }
}

// Attach event listeners
generateButton.addEventListener("click", generateQRCode);
downloadButton.addEventListener("click", downloadQR);

inputElement.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        generateQRCode(e);
    }
});

const inputField = inputElement;
inputField.addEventListener("blur", function () {
    if (inputField.value.trim() === "") {
    }
});

function resetUI() {
    qrBoxDiv.classList.remove("active");
    qrImage.src = "";
    qrImage.alt = "QR preview will appear here";
    downloadButton.style.display = "none";
    generateButton.style.background = "var(--primary-blue)";
}

resetUI();