const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const { verificaToken } = require("../middlewares/autenticacion");

// ==================================================
// Renueva Token Usuarios Administradores
// ==================================================
router.get("/renuevatoken", verificaToken, (req, res) => {
    var token = jwt.sign({ usuario: req.usuario }, process.env.SEED, { expiresIn: 14400 }); // 4 horas
    return res.status(200).json({
        ok: true,
        token: token
    });
});
// ==================================================
// Renueva Token Cliente
// ==================================================
router.get("/renuevatoken-cliente", verificaToken, (req, res) => {
    var token = jwt.sign({ cliente: req.cliente }, process.env.SEED, { expiresIn: 604800 }); // 7 dias - 168 horas
    return res.status(200).json({
        ok: true,
        token: token
    });
});
// ==================================================
// Autenticación normal
// ==================================================
router.post("/", (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }
        if (!usuarioDB) {
            /* email */
            return res.status(400).json({
                ok: false,
                error: { message: "Usuario o contraseña incorrectos" },
                mensaje: "Credenciales incorrectas",
                error: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            /* password */
            return res.status(400).json({
                ok: false,
                err: { message: "Usuario o contraseña incorrectos" },
                mensaje: "Credenciales incorrectas",
                error: err
            });
        }
        usuarioDB.password = ":)";
        var token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
            expiresIn: 14400
        }); // 4 horas
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });
});
// ==================================================
// Autenticación normal Cliente
// ==================================================
router.post("/client", (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, clienteDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar cliente",
                errors: err
            });
        }
        if (!clienteDB) {
            /* email */
            return res.status(400).json({
                ok: false,
                error: { message: "Usuario o contraseña incorrectos" },
                mensaje: "Credenciales incorrectas",
                error: err
            });
        }
        if (!bcrypt.compareSync(body.password, clienteDB.password)) {
            /* password */
            return res.status(400).json({
                ok: false,
                err: { message: "Usuario o contraseña incorrectos" },
                mensaje: "Credenciales incorrectas",
                error: err
            });
        }
        clienteDB.password = ":)";
        var token = jwt.sign({ cliente: clienteDB }, process.env.SEED, {
            expiresIn: 604800
        }); // 4 horas
        res.status(200).json({
            ok: true,
            cliente: clienteDB,
            token: token,
            id: clienteDB._id
        });
    });
});

function obtenerMenu(ROLE) {
    var menu = [{
            titulo: "Principal",
            icono: "mdi mdi-gauge",
            submenu: [{ titulo: "Dashboard", url: "/dashboard" }]
        },
        {
            titulo: "Mantenimientos",
            icono: "mdi mdi-folder-multiple",
            submenu: [
                /* { titulo: 'Usuarios', url: '/usuarios' }, */
                { titulo: "Categorias", url: "/categorias" },
                { titulo: "Productos", url: "/productos" },
                { titulo: "Marcas", url: "/marcas" },
                { titulo: "Sucursales", url: "/sucursales" },
                { titulo: "Clientes", url: "/clientes" },
            ]
        }
    ];
    if (ROLE === "ADMIN_ROLE") {
        menu[1].submenu.unshift({ titulo: "Usuarios", url: "/usuarios" });
    }
    return menu;
}
module.exports = router;