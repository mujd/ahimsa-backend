var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();
var Usuario = require('../models/usuario');
var Producto = require('../models/producto');
var Categoria = require('../models/categoria');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['categorias', 'productos', 'usuarios'];
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
    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.')[0];
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }
    // Nombre de archivo personalizado
    // 12312312312-123.png
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;
    // Mover el archivo del temporal a un path
    var path = `./src/uploads/${ tipo }/${ nombreArchivo }`;
    console.log(path);
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
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './src/uploads/usuarios/' + usuario.img;
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
                    ok: true,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });
            }
            var pathViejo = './src/uploads/productos/' + producto.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            producto.img = nombreArchivo;
            producto.save((err, productoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    producto: productoActualizado
                });
            });
        });
    }
    if (tipo === 'categorias') {
        Categoria.findById(id, (err, categoria) => {
            if (!categoria) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Categoria no existe',
                    errors: { message: 'Categoria no existe' }
                });
            }
            var pathViejo = './src/uploads/categorias/' + categoria.img;
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
    var tipoColeccion;
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
                    var pathViejo = resultado.img;
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

module.exports = app;