const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');

/*
    - 0.5mb = 524288 bytes
    - 1mb = 1048576 bytes
    - 1,5mb = 1572864 bytes
*/
let fileSize = Number(524288);
// default options
router.use(fileUpload({
    limits: { fileSize: fileSize },

}));


router.put('/:tipo/:id', (req, res, next) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // tipos de colección
    let tiposValidos = ['categorias', 'productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }
    if (req.files.imagen.truncated) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Supera el tamaño maximo permitido para un archivo',
            errors: { message: `El tamaño de su archivo supera el limite esperado. Debe seleccionar archivos con tamaño menor o igual a ${fileSize}bytes (0,5mb, 500kb)` }
        });
    }
    // Obtener nombre del archivo
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }
    // Nombre de archivo personalizado
    // 12312312312-123.png
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;
    // Mover el archivo del temporal a un path
    let path = `./src/uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            let pathViejo = './src/uploads/usuarios/' + usuario.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'productos') {
        Producto.findById(id, (err, producto) => {
            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Producto no existe',
                    errors: { message: 'Producto no existe' }
                });
            }
            let pathViejo = './src/uploads/productos/' + producto.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            producto.img = nombreArchivo;
            producto.save((err, productoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de producto actualizada',
                    producto: productoActualizado
                });
            });
        });
    }
    if (tipo === 'categorias') {
        Categoria.findById(id, (err, categoria) => {
            if (!categoria) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Categoria no existe',
                    errors: { message: 'Categoria no existe' }
                });
            }
            let pathViejo = './src/uploads/categorias/' + categoria.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            categoria.img = nombreArchivo;
            categoria.save((err, categoriaActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de categoria actualizada',
                    categoria: categoriaActualizado
                });
            });
        });
    }
}

function subirPorTipoOtro(tipo, id, path, res) {
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
    tipoColeccion.findById(id, 'nombre img')
        .exec(
            (err, resultado) => {
                if (!resultado) {
                    fs.unlink(path); // Borro el archivo cuando no tengo id valido
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se encontro nada con ese Id',
                        errors: { message: 'Debe selecionar un Id valido' }
                    });
                } else {
                    let pathViejo = resultado.img;
                    // Si existe, Elimino la imagen vieja
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo);
                    }
                    resultado.img = path;
                    resultado.save((err, resultadoActualizado) => {
                        res.status(200).json({
                            ok: true,
                            pathviejo: resultado.img,
                            [tipo]: resultadoActualizado,
                            mensaje: 'Imagen de ' + tipo + ' actualizada'
                        });
                    });
                }
            });
}

module.exports = router;