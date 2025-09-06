const { spawn } = require("child_process");
const path = require("path");

let lastProgress = 0;
let downloading = false;

module.exports = {
  // Render principal
  index: (req, res) => {
    res.render("index");
  },

  // Obtener formatos disponibles
  formats: (req, res) => {
    const { url } = req.body;
    if (!url) return res.json({ error: "No se proporcionó URL" });

    const ytdlp = spawn("yt-dlp", ["-F", url]);

    let output = "";
    let errorOutput = "";

    ytdlp.stdout.on("data", data => (output += data.toString()));
    ytdlp.stderr.on("data", data => (errorOutput += data.toString()));

    ytdlp.on("close", code => {
      if (code !== 0) {
        return res.json({ error: `yt-dlp falló: ${errorOutput}` });
      }

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
  },

  // Descargar video/audio
  download: (req, res) => {
    const { url, format, type } = req.body;
    if (!url || !format) return res.json({ error: "Faltan parámetros" });

    const output = path.join(process.cwd(), "descargas", "%(title)s.%(ext)s");

    const args = ["-f", format, "-o", output, url];
    const ytdlp = spawn("yt-dlp", args);

    downloading = true;
    lastProgress = 0;

    let errorOutput = "";

    ytdlp.stdout.on("data", data => {
      const line = data.toString();
      const match = line.match(/(\d+(?:\.\d+)?)%/); // captura 23% o 23.5%
      if (match) lastProgress = parseFloat(match[1]);
    });

    ytdlp.stderr.on("data", data => (errorOutput += data.toString()));

    ytdlp.on("close", code => {
      downloading = false;
      if (code !== 0) {
        console.error(`yt-dlp terminó con error: ${errorOutput}`);
      } else {
        lastProgress = 100;
      }
    });

    res.json({ status: "started" });
  },

  // Progreso en vivo
  progress: (req, res) => {
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
  }
};