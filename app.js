const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3000;

let lastProgress = 0;
let downloading = false;

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Página principal
app.get("/", (req, res) => {
  res.render("index");
});

// Obtener formatos disponibles
app.post("/formats", (req, res) => {
  const url = req.body.url;
  if (!url) return res.json({ error: "No se proporcionó URL" });

  const ytdlp = spawn("yt-dlp", ["-F", url]);

  let output = "";
  ytdlp.stdout.on("data", data => (output += data.toString()));
  ytdlp.stderr.on("data", data => console.error(data.toString()));

  ytdlp.on("close", () => {
    const formats = [];
    const lines = output.split("\n");

    for (const line of lines) {
      if (/^\d+/.test(line)) {
        const parts = line.trim().split(/\s+/);
        const id = parts[0];
        const ext = parts[1];
        const resolution = parts[2];
        const note = parts.slice(3).join(" ");
        formats.push({ id, ext, resolution, note });
      }
    }
    res.json({ formats });
  });
});

// Descargar el video/audio
app.post("/download", (req, res) => {
  const { url, format, type } = req.body;
  if (!url || !format) return res.json({ error: "Faltan parámetros" });

  const output = path.join(__dirname, "descargas", "%(title)s.%(ext)s");
  const args = ["-f", format, "-o", output, url];
  const ytdlp = spawn("yt-dlp", args);

  downloading = true;
  lastProgress = 0;

  ytdlp.stdout.on("data", data => {
    const line = data.toString();
    const match = line.match(/(\d+\.\d)%/);
    if (match) lastProgress = parseFloat(match[1]);
  });

  ytdlp.stderr.on("data", data => console.error(data.toString()));

  ytdlp.on("close", () => {
    downloading = false;
    lastProgress = 100;
  });

  res.json({ status: "started" });
});

// Progreso en vivo
app.get("/progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    res.write(`data: ${lastProgress}\n\n`);
    if (!downloading && lastProgress >= 100) {
      clearInterval(interval);
      res.end();
    }
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});