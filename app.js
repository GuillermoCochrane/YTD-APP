const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");

const outputDir = path.join(__dirname, "descargas");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Página principal
app.get("/", (req, res) => {
  res.render("index");
});

// Obtener formatos
app.post("/formats", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL requerida" });

  const ytdlp = spawn("yt-dlp", ["-F", url]);
  let output = "";

  ytdlp.stdout.on("data", data => {
    output += data.toString();
  });

  ytdlp.stderr.on("data", data => {
    console.error(`stderr: ${data}`);
  });

  ytdlp.on("close", () => {
    const lines = output.split("\n").filter(line => /^\d+/.test(line));
    const formats = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return {
        id: parts[0],
        ext: parts[1],
        resolution: parts[2] || "audio",
        note: parts.slice(3).join(" ")
      };
    });
    res.json({ formats });
  });
});

// Progreso en vivo con SSE
app.get("/progress", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });

  const send = (msg) => res.write(`data: ${msg}\n\n`);

  // Guardamos función de envío en request
  req.app.set("progressStream", send);

  req.on("close", () => {
    req.app.set("progressStream", null);
  });
});

// Descargar
app.post("/download", (req, res) => {
  const { url, format, type } = req.body;

  if (!url || !format) {
    return res.status(400).json({ error: "URL y formato requeridos" });
  }

  let outputPattern = `${outputDir}/%(title)s.%(ext)s`;
  if (type === "playlist") {
    outputPattern = `${outputDir}/%(playlist_title)s/%(title)s.%(ext)s`;
  }

  const args = [
    "-f", `${format}+bestaudio`,
    "--merge-output-format", "mp4",
    "--embed-metadata",
    "--embed-thumbnail",
    "-o", outputPattern,
    url
  ];

  const ytdlp = spawn("yt-dlp", args);

  ytdlp.stdout.on("data", data => {
    const line = data.toString();
    const match = line.match(/\[download\]\s+(\d+\.\d+)%/);
    if (match) {
      const percent = parseFloat(match[1]);
      const stream = req.app.get("progressStream");
      if (stream) stream(percent);
    }
    console.log(line);
  });

  ytdlp.stderr.on("data", data => {
    console.error(`stderr: ${data}`);
  });

  ytdlp.on("close", code => {
    console.log(`yt-dlp terminó con código ${code}`);
    const stream = req.app.get("progressStream");
    if (stream) stream("100"); // aseguramos completar
  });

  res.json({ message: "Descarga iniciada" });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});