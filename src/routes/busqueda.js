const express = require('express');
let app = express();
let Categoria = require('../models/categoria');
let Producto = require('../models/producto');
let Usuario = require('../models/usuario');


// ==================================================
// Busqueda por colección
// ==================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    let busqueda = req.params.busqueda;
    let tabla = req.params.tabla;
    let regex = new RegExp(busqueda, 'i');

    let promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'productos':
            promesa = buscarProductos(busqueda, regex);
            break;
        case 'categorias':
            promesa = buscarCategorias(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, productos y categorias',
                error: { message: 'Tipo de tabla/colección no válido' }
            });

    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

// ==================================================
// Busqueda general
// ==================================================
app.get('/todo/:busqueda', (req, res, next) => {

    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarCategorias(busqueda, regex),
            buscarProductos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                categorias: respuestas[0],
                productos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarCategorias(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Categoria.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, categorias) => {
                if (err) {
                    reject('Error al cargar categorias', err);
                } else {
                    resolve(categorias);
                }
            });
    });
}

function buscarProductos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        /* Producto.find({ nombre: regex }) */
        Producto.find({}, 'nombre precioUnitario descripcion disponible ingredientes categoria usuario')
            .or([{ 'nombre': regex }, { 'ingredientes': regex }])
            .populate('categoria', 'nombre descripcion')
            .populate('usuario', 'nombre email')
            .exec((err, productos) => {

                if (err) {
                    reject('Error al cargar productos', err);
                } else {
                    resolve(productos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;