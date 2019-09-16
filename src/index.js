require("dotenv/config");
require("./config/config");
const express = require("express");
const mongoose = require("mongoose");

// Inicializar variables
const app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Parse application/json
app.use(express.json());

// Configuración global de rutas
app.use(require("./routes/index"));

// Configuración mongo
const mongoOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(process.env.URLDB, mongoOptions, (err, res) => {
    if (err) throw err;
    console.log("BD: \x1b[32m%s\x1b[0m", "online");
});
require('./routes/seed');


// Configuración puerto
app.listen(process.env.PORT, () => {
    console.log(
        "Server puerto:" + "\x1b[35m " + process.env.PORT + "\x1b[0m" + "\x1b[32m",
        "online",
        "\x1b[0m"
    );
});