// Ambil jsPDF dari global UMD
const { jsPDF } = window.jspdf;

const addPhotoBtn = document.getElementById("addPhotoBtn");
const photoInput = document.getElementById("photoInput");
const photoList = document.getElementById("photoList");
const downloadPDFBtn = document.getElementById("downloadPDFBtn");
const pdfSizeSelect = document.getElementById("pdfSize");

const cropModal = document.getElementById("cropModal");

// Struktur modal
const cropContent = document.createElement("div");
cropContent.className = "crop-content";

const previewBox = document.createElement("div");
previewBox.className = "crop-preview-box";
const cropPreview = document.createElement("img");
previewBox.appendChild(cropPreview);

const cropBox = document.createElement("div");
cropBox.className = "crop-box";
const cropImage = document.createElement("img");
cropBox.appendChild(cropImage);

const cropButtons = document.createElement("div");
cropButtons.className = "crop-buttons";
const applyBtn = document.createElement("button");
applyBtn.textContent = "Apply";
applyBtn.className = "btn-apply";
const cancelBtn = document.createElement("button");
cancelBtn.textContent = "Cancel";
cancelBtn.className = "btn-cancel";
cropButtons.appendChild(applyBtn);
cropButtons.appendChild(cancelBtn);

cropContent.appendChild(previewBox);
cropContent.appendChild(cropBox);
cropContent.appendChild(cropButtons);
cropModal.appendChild(cropContent);

let photos = [];
let cropper = null;

// Buka input kamera/gallery
addPhotoBtn.addEventListener("click", () => {
  photoInput.click();
});

// Load foto dari input
photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (!e.target.result) return;
    openCropper(e.target.result);
  };
  reader.readAsDataURL(file);
});

// Fungsi buka cropper
function openCropper(imgSrc) {
  cropModal.classList.add("show");
  cropImage.src = imgSrc;

  if (cropper) cropper.destroy();
  cropper = new Cropper(cropImage, {
    viewMode: 1,
    autoCropArea: 1,
    responsive: true,
    background: false,
    ready() {
      const updatePreview = () => {
        const canvas = cropper.getCroppedCanvas({ width: 120, height: 120 });
        cropPreview.src = canvas.toDataURL("image/jpeg");
      };
      cropImage.addEventListener("crop", updatePreview);
      updatePreview();
    },
  });
}

// Apply
applyBtn.addEventListener("click", () => {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas();
  photos.push(canvas.toDataURL("image/jpeg"));
  renderPhotos();

  cropper.destroy();
  cropper = null;
  cropModal.classList.remove("show");
});

// Cancel
cancelBtn.addEventListener("click", () => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  cropModal.classList.remove("show");
});

// Render preview foto
function renderPhotos() {
  photoList.innerHTML = "";
  photos.forEach((src, index) => {
    const div = document.createElement("div");
    div.classList.add("photo-item");

    const img = document.createElement("img");
    img.src = src;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => {
      photos.splice(index, 1);
      renderPhotos();
    });

    div.appendChild(img);
    div.appendChild(removeBtn);
    photoList.appendChild(div);
  });
}

// Download PDF
downloadPDFBtn.addEventListener("click", () => {
  if (photos.length === 0) {
    alert("Tambahkan foto terlebih dahulu!");
    return;
  }

  const size = pdfSizeSelect.value;
  let pdf;

  if (size === "A4") {
    pdf = new jsPDF("p", "mm", "a4");
  } else {
    pdf = new jsPDF("p", "mm", [330, 210]); // F4
  }

  photos.forEach((src, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(src, "JPEG", 10, 10, 190, 277);
  });

  pdf.save("document.pdf");
});
