const router = require('express').Router();
const _ = require('underscore');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let Categoria = require('../models/categoria');
let Usuario = require('../models/usuario');


// ============================
// Mostrar todas las categorias
// ============================
router.get('/', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Categoria.find({}, 'nombre descripcion img usuario')
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando categorias',
                    error: err
                });
            }

            Categoria.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    categorias,
                    total: conteo
                });
            });

        });
});

// ============================
// Mostrar todas las categorias Activas
// ============================
router.get('/activas', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Categoria.find({}, 'nombre descripcion img usuario')
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando categorias',
                    error: err
                });
            }

            Categoria.countDocuments({ estado: true }, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    categorias,
                    total: conteo
                });
            });

        });
});

// ============================
// Mostrar una categoria por ID
// ============================
router.get('/:id', verificaToken, (req, res) => {
    //Categoria.findById();
    let id = req.params.id;
    Categoria.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar categoria',
                    errors: err
                });
            }
            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La categoria con el id ' + id + ' no existe',
                    errors: { message: 'No existe una categoria con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                categoria: categoriaDB
            });
        });
});

// ============================
// Crear nueva categoria
// ============================
router.post('/', verificaToken, (req, res) => {
    // regresa la nueva categoria
    usuarioId = req.usuario._id
    let body = req.body; //Obtener el body

    let categoria = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuario._id // Con middleware verificaToken se puede obtener el id del usuario
    });
    let usuarioMensaje;
    Usuario.findById(usuarioId).exec((err, usuarioDB) => {
        if (err) {
            return res.status(500).json({ ok: false, errors: err });
        }
        usuarioMensaje = usuarioDB;
    });
    console.log(usuarioMensaje);
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear categoria',
                errors: err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear categoria',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            categoria: categoriaDB,
            creado_por: {
                usuario_id: usuarioMensaje._id,
                usuario_nombre: usuarioMensaje.nombre,
                usuario_email: usuarioMensaje.email
            }
        });
    });
});

// ============================
// Actualizar categoria
// ============================
router.put('/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    /* let body = req.body;
    let bodyCategoria = { nombre: body.nombre, descripcion: body.descripcion, estado: body.estado }; */
    let bodyCategoria = _.pick(req.body, ['nombre', 'descripcion', 'estado']);
    Categoria.findByIdAndUpdate(id, bodyCategoria, { new: true, runValidators: false }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar categoria',
                errors: err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La categoria con el id ' + id + ' no existe',
                errors: { message: 'No existe una categoria con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ==================================================
// Cambia estado a un usuario 
// ==================================================
router.put('/estado/:id', [verificaToken], (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cambiar estado a la categoria',
                errors: err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una categoria con ese id',
                errors: { message: 'No existe una categoria con ese id' }
            });
        }
        let estadoMensaje;
        if (categoriaDB.estado == true) {
            categoriaDB.estado = false;
            estadoMensaje = "DESACTIVADO";
        } else {
            categoriaDB.estado = true;
            estadoMensaje = "ACTIVADO";
        }

        categoriaDB.save((err, categoriaBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categoria: categoriaBorrado,
                mensaje: `Categoria actualizada, nuevo estado '${estadoMensaje}'`
            });
        });
    });

});

// ============================
// Borrar categorias
// ============================
router.delete('/delete/:id', [verificaToken], (req, res) => {
    // solo un administrador puede borrar categorias
    // Categoria.findByIdAndRemove
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar categoria',
                errors: err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La categoria con el id ' + id + ' no existe',
                errors: { message: 'No existe una categoria con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Categoria Borrada'
        });
    });
});

module.exports = router;