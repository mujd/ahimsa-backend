const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');
// ======================
// BUSCAR IMAGENES POR NOMBRE DE IMAGEN
// ======================
router.get('/:tipo/:img', (req, res, next) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }
});
// ======================
// BUSCAR IMAGENES POR ID
// ======================
router.get('/imgs/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;



    let tipoColeccion;
    switch (tipo) {
        case 'categorias':
            tipoColeccion = Categoria;
            break;
        case 'productos':
            tipoColeccion = Producto;
            break;
        case 'usuarios':
            tipoColeccion = Usuario;
            break;
        default:
            return;
    }
    tipoColeccion.findById(id)
        .select('productImage')
        .exec(
            (err, resultado) => {
                if (!resultado) {
                    let pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
                    res.sendFile(pathNoImagen);
                } else {
                    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${resultado.productImage}`);
                    if (fs.existsSync(pathImagen)) {
                        res.sendFile(pathImagen);
                    }
                }
            });
});

module.exports = router;