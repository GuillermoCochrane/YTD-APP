
let currentStep = 1;
let selectedType = "";
let selectedFormatType = "";
let selectedFormat = "";
let formats = [];
let url = "";

function showStep(step) {
  document
    .querySelectorAll(".step")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(`step${step}`).classList.add("active");
  currentStep = step;
}

function goBack(step) {
  showStep(step - 1);
}

function selectType(type) {
  selectedType = type;
  showStep(2);
  document.getElementById("url").focus();
}

function processUrl() {
  url = document.getElementById("url").value;
  if (!url) {
    alert("Por favor ingresa una URL");
    return;
  }

  const dlg = document.getElementById("loadingDialog");
  dlg.showModal();

  fetch("/formats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })
    .then((res) => res.json())
    .then((data) => {
      dlg.close();
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }
      formats = data.formats;
      showStep(3);
    })
    .catch((err) => {
      dlg.close();
      alert("Error: " + err);
    });
}

function selectFormatType(type) {
  selectedFormatType = type;
  const select = document.getElementById("formatSelect");
  select.innerHTML = '<option value="">-- Elige un formato --</option>';

  const filtered = formats.filter((f) => {
    if (type === "audio")
      return f.ext === "m4a" || f.note.includes("audio");
    else
      return f.resolution !== "audio" && !f.note.includes("audio only");
  });

  filtered.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.resolution} - ${f.ext} ${f.note}`;
    select.appendChild(opt);
  });

  showStep(4);
}

function prepareDownload() {
  const select = document.getElementById("formatSelect");
  selectedFormat = select.value;
  if (!selectedFormat) {
    alert("Selecciona un formato");
    return;
  }
  showStep(5);
}

function startDownload() {
  fetch("/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      format: selectedFormat,
      type: selectedType,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      document.getElementById("status").textContent = "Descargando...";
      const evtSource = new EventSource("/progress");
      evtSource.onmessage = function (e) {
        const percent = parseFloat(e.data);
        if (!isNaN(percent)) {
          document.getElementById("progressBar").style.width =
            percent + "%";
          document.getElementById(
            "status"
          ).textContent = `Descargando... ${percent.toFixed(1)}%`;
        }
      };
    });
}