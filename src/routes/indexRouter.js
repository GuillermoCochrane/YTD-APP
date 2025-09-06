const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");


// Rutas principales
router.get("/", indexController.index);
router.post("/formats", indexController.formats);
router.post("/download", indexController.download);
router.get("/progress", indexController.progress);

module.exports = router;