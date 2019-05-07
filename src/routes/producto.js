const router = require('express').Router();
const _ = require('underscore');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let Producto = require('../models/producto');
let Categoria = require('../models/categoria');
let Usuario = require('../models/usuario');


// ============================
// Mostrar todos los productos
// ============================
router.get('/', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Producto.find({}, 'nombre descripcion precioUnitario ingredientes disponible categoria usuario')
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'nombre descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando productos',
                    error: err
                });
            }
            Producto.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    productos,
                    total: conteo
                });
            });

        });
});

// ============================
// Mostrar todas las productos Activas
// ============================
router.get('/disponibles', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Producto.find({}, 'nombre descripcion precioUnitario ingredientes disponible categoria usuario')
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'nombre descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando productos',
                    error: err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    productos,
                    total: conteo
                });
            });

        });
});

// ============================
// Mostrar una producto por ID
// ============================
router.get('/:id', verificaToken, (req, res) => {
    //Producto.findById();
    let id = req.params.id;
    Producto.findById(id)
        .populate('categoria', 'nombre descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar producto',
                    errors: err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El producto con el id ' + id + ' no existe',
                    errors: { message: 'No existe un producto con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                producto: productoDB
            });
        });
});

// ============================
// Crear nueva producto
// ============================
router.post('/', verificaToken, (req, res) => {
    // regresa la nueva producto
    usuarioId = req.usuario._id
    let body = req.body; //Obtener el body

    let producto = new Producto({
        nombre: body.nombre,
        precioUnitario: body.precioUnitario,
        descripcion: body.descripcion,
        ingredientes: body.ingredientes,
        categoria: body.categoria,
        usuario: req.usuario._id // Con middleware verificaToken se puede obtener el id del usuario
    });
    let categoriaMensaje;
    Categoria.findById(body.categoria).exec((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ ok: false, errors: err });
        }
        categoriaMensaje = categoriaDB;
    });
    let usuarioMensaje;
    Usuario.findById(usuarioId).exec((err, usuarioDB) => {
        if (err) {
            return res.status(500).json({ ok: false, errors: err });
        }
        usuarioMensaje = usuarioDB;
    });
    console.log(usuarioMensaje);
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear producto',
                errors: err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear producto',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            producto: productoDB,
            categoria: {
                id: categoriaMensaje._id,
                nombre: categoriaMensaje.nombre
            },
            creado_por: {
                usuario_id: usuarioMensaje._id,
                usuario_nombre: usuarioMensaje.nombre,
                usuario_email: usuarioMensaje.email
            }
        });
    });
});

// ============================
// Actualizar producto
// ============================
router.put('/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let bodyProducto = _.pick(req.body, ['nombre', 'precioUnitario', 'descripcion', 'ingredientes', 'categoria', 'disponible']);
    Producto.findByIdAndUpdate(id, bodyProducto, { new: true, runValidators: false }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar producto',
                errors: err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El producto con el id ' + id + ' no existe',
                errors: { message: 'No existe un producto con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            producto: productoDB
        });
    });
});

// ==================================================
// Cambia estado a un usuario 
// ==================================================
router.put('/estado/:id', [verificaToken], (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cambiar disponibilidad al producto',
                errors: err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un producto con ese id',
                errors: { message: 'No existe un producto con ese id' }
            });
        }
        let estadoMensaje;
        if (productoDB.disponible == true) {
            productoDB.disponible = false;
            disponibleMensaje = "NO-DISPONIBLE";
        } else {
            productoDB.disponible = true;
            disponibleMensaje = "DISPONIBLE";
        }

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: `Producto actualizado, nuevo estado '${disponibleMensaje}'`
            });
        });
    });

});

// ============================
// Borrar productos
// ============================
router.delete('/delete/:id', [verificaToken], (req, res) => {
    // solo un administrador puede borrar productos
    // Producto.findByIdAndRemove
    let id = req.params.id;

    Producto.findByIdAndRemove(id, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar producto',
                errors: err
            });
        }
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El producto con el id ' + id + ' no existe',
                errors: { message: 'No existe un producto con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Producto Borrado exitosamente!'
        });
    });
});

module.exports = router;