# 🎬 YouTube Downloader Web (Express + EJS + yt-dlp + ffmpeg)

Aplicación web minimalista para descargar videos o playlists de YouTube con distintas calidades de video o solo audio.  
Hecha con **Node.js (Express + EJS)** en el frontend y **yt-dlp + ffmpeg** en el backend.

---

## 📋 Requisitos previos

Antes de empezar, asegurate de tener instalado:

1. **Node.js** (versión 16 o superior)  
   👉 [Descargar Node.js](https://nodejs.org/)

2. **Python 3.9+**  
   👉 [Descargar Python](https://www.python.org/downloads/)

3. **yt-dlp** (se instala con pip, usando Python):
      ```powershell
      pip install -U yt-dlp
      ```

>⚠️ Si después de instalar te da `yt-dlp: command not found`, agregá la carpeta `Scripts` de Python al PATH (ver abajo).

4. **ffmpeg** (necesario para unir audio y video):

   * Descargar el zip precompilado desde el repo oficial de builds:
     👉 [ffmpeg builds](https://github.com/yt-dlp/FFmpeg-Builds/releases)
   * Elegí el archivo **`ffmpeg-master-latest-win64-gpl.zip`** (181 MB).
   * Descomprimilo en `C:\ffmpeg-8.0` (o la carpeta que prefieras).
   * La ruta final debería verse así:
   

   ```
   C:\ffmpeg-8.0\bin\ffmpeg.exe
   C:\ffmpeg-8.0\bin\ffprobe.exe
   ```

---

## ⚙️ Configuración del PATH en Windows

Para que `yt-dlp` y `ffmpeg` se puedan usar desde cualquier lugar, agregalos al **PATH**.
Abrí **PowerShell** y ejecutá (ajustando las rutas si las cambiaste):

### Agregar `yt-dlp` al PATH

```powershell
[System.Environment]::SetEnvironmentVariable(
  "Path",
  $env:Path + ";C:\Users\<TU_USUARIO>\AppData\Roaming\Python\Python312\Scripts",
  "User"
)
```

### Agregar `ffmpeg` al PATH

```powershell
[System.Environment]::SetEnvironmentVariable(
  "Path",
  $env:Path + ";C:\ffmpeg-8.0\bin",
  "User"
)
```

> 🔄 Cerrá y volvé a abrir la terminal después de ejecutar estos comandos.
> Probá que funcione con:
>
> ```powershell
> yt-dlp --version
> ffmpeg -version
> ffprobe -version
> ```

---

## 🚀 Instalación del proyecto

1. Cloná este repo:

   ```powershell
   git clone https://github.com/GuillermoCochrane/YTD-APP.git
   cd YTD-APP
   ```

2. Instalá las dependencias de Node.js:

   ```powershell
   npm install
   ```

3. Asegurate de tener la carpeta `descargas` en la raíz del proyecto (donde se guardarán los archivos).

---

## ▶️ Uso

1. Iniciá el servidor:

   ```powershell
   npm start
   ```

2. Abrí el navegador en:

   ```
   http://localhost:3000
   ```

3. Flujo de la app:

   * Elegí si querés **video** o **playlist**.
   * Pegá la URL de YouTube.
   * Seleccioná si querés **solo audio** o **video completo**.
   * Elegí la calidad desde el menú desplegable.
   * Iniciá la descarga.

Los archivos se guardarán en la carpeta `descargas/`.

---

## 📂 Estructura del proyecto

```
.
├── app.js             # Servidor Express
├── views/
│   └── index.ejs      # Interfaz con pasos
├── public/            # Archivos estáticos (CSS, JS)
├── descargas/         # Carpeta donde se guardan los videos descargados
└── package.json
```

---

## ❗ Problemas comunes

* **`yt-dlp: command not found`**
  → Asegurate de haber agregado la carpeta `Scripts` de Python al PATH.

* **Video y audio descargados por separado**
  → No tenés `ffmpeg` instalado o no está en el PATH.

* **El progreso se queda clavado**
  → A veces YouTube cambia formatos, probá con otra calidad o actualizá `yt-dlp`:

  ```powershell
  pip install -U yt-dlp
  ```

---

## 📜 Licencia

MIT – Usalo, modificálo y compartilo sin dramas.

---