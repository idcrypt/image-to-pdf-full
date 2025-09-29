// Ambil jsPDF dari global UMD
const { jsPDF } = window.jspdf;

const addPhotoBtn = document.getElementById("addPhotoBtn");
const photoInput = document.getElementById("photoInput");
const photoList = document.getElementById("photoList");
const downloadPDFBtn = document.getElementById("downloadPDFBtn");
const pdfSizeSelect = document.getElementById("pdfSize");

const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");
const previewBox = document.querySelector(".preview-box");

const applyBtn = document.getElementById("applyBtn");
const cancelBtn = document.getElementById("cancelBtn");
const rotateLeftBtn = document.getElementById("rotateLeftBtn");
const rotateRightBtn = document.getElementById("rotateRightBtn");

let photos = [];
let cropper = null;

// Buka input kamera/gallery
addPhotoBtn.addEventListener("click", () => {
  photoInput.click();
});

// Load foto dari input (multiple)
photoInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  handleFilesSequentially(files);
});

// Proses file satu per satu dengan crop
function handleFilesSequentially(files) {
  if (files.length === 0) return;

  const file = files.shift();
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!e.target.result) return;
    openCropper(e.target.result, () => {
      // setelah apply/cancel, lanjut file berikutnya
      handleFilesSequentially(files);
    });
  };
  reader.readAsDataURL(file);
}

// Fungsi buka cropper modal
function openCropper(imgSrc, callback) {
  cropModal.style.display = "flex";
  cropImage.src = imgSrc;

  if (cropper) cropper.destroy();
  cropper = new Cropper(cropImage, {
    viewMode: 1,
    autoCropArea: 1,
    responsive: true,
    background: false,
    preview: previewBox,
  });

  // Apply
  applyBtn.onclick = () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas();
    photos.push(canvas.toDataURL("image/jpeg"));
    renderPhotos();

    cropper.destroy();
    cropper = null;
    cropModal.style.display = "none";
    if (callback) callback();
  };

  // Cancel
  cancelBtn.onclick = () => {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    cropModal.style.display = "none";
    if (callback) callback();
  };

  // Rotate left
  rotateLeftBtn.onclick = () => {
    if (cropper) cropper.rotate(-90);
  };

  // Rotate right
  rotateRightBtn.onclick = () => {
    if (cropper) cropper.rotate(90);
  };
}

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
