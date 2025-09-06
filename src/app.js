const express = require("express");
const path = require("path");
const indexRouter = require("./routes/indexRouter");

// Configuración
const app = express();
const PORT = process.env.PORT || 3000;;
app.set("view engine", "ejs");
app.use(express.static('public'));// Setea carpeta de recursos estáticos
app.set('views', path.join(__dirname, './views'));
app.use(express.json()); // Necesario para procesar información POST
app.use(express.urlencoded({ extended: false })); // Necesario para procesar información POST

// Seteo de rutas
app.use('/', indexRouter);

//Error 404
app.use((req,res,next) =>{
    res.status(404).send("Error 404: Página no encontrada")
})

//Levanatando el servidor
app.listen(PORT, ()=>{console.log("\n------------------------------------\nLevantando servidor en puerto " + PORT +  ": \nhttp://localhost:" + PORT + "\n------------------------------------\n")
});