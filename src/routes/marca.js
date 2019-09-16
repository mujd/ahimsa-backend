const express = require('express');
const router = express.Router();
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const Marca = require('../models/marca');
const Usuario = require('../models/usuario');


// ============================
// Mostrar todas las marcas
// ============================
router.get('/', verificaToken, (req, res) => {
    let perPage = req.query.perPage || 10;
    perPage = Number(perPage);
    let page = req.query.page || 1;
    page = Math.max(0, page);
    Marca.find({}, '_id nombre descripcion estado orden usuario')
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort({ orden: 'asc' })
        .populate('usuario', 'nombre email')
        .exec((err, marcas) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando marcas',
                    error: err
                });
            }
            if (!marcas) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La marca con el id ' + id + ' no existe',
                    errors: { message: 'No existe una marca con ese ID' }
                });
            }

            Marca.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    marcas,
                    current_page: page,
                    total_pages: Math.ceil(conteo / perPage),
                    total_marcas: conteo
                });
            });

        });
});

// ============================
// Mostrar todas las marcas Activas
// ============================
router.get('/estado/:estado', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    let estado = req.params.estado;
    let opcion = {};
    if (req.params.estado == 'true') {
        opcion = { estado: true };
    } else {
        opcion = { estado: false };
    }
    Marca.find(opcion, '_id nombre descripcion estado orden usuario')
        .sort({ orden: 'asc' })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .exec((err, marcas) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando marcas',
                    error: err
                });
            }
            if (!marcas) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La marca con el estado ' + estado + ' no existe',
                    errors: { message: 'No existe una marca con ese estado' }
                });
            }
            Marca.countDocuments({ estado: true }, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    marcas,
                    total: conteo
                });
            });

        });
});

// ============================
// Mostrar una marca por ID
// ============================
router.get('/:id', verificaToken, (req, res) => {
    //Marca.findById();
    let id = req.params.id;
    Marca.findById(id)
        .sort({ orden: 'asc' })
        .populate('usuario', 'nombre img email')
        .exec((err, marcaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar marca',
                    errors: err
                });
            }
            if (!marcaDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La marca con el id ' + id + ' no existe',
                    errors: { message: 'No existe una marca con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                marca: marcaDB
            });
        });
});

// ============================
// Crear nueva marca
// ============================
router.post('/', verificaToken, (req, res) => {
    // regresa la nueva marca
    usuarioId = req.usuario._id
    let body = req.body; //Obtener el body
    let marca = new Marca({
        nombre: body.nombre,
        descripcion: body.descripcion,
        estado: body.estado,
        orden: body.orden,
        usuario: req.usuario._id // Con middleware verificaToken se puede obtener el id del usuario
    });
    let usuarioMensaje;
    Usuario.findById(usuarioId).exec((err, usuarioDB) => {
        if (err) {
            return res.status(500).json({ ok: false, errors: err });
        }
        usuarioMensaje = usuarioDB;
    });
    marca.save((err, marcaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear marca',
                errors: err
            });
        }
        if (!marcaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear marca',
                errors: err
            });
        }
        /* console.log(marcaMensaje); */
        res.status(200).json({
            ok: true,
            marca: {
                _id: marcaDB.id,
                nombre: marcaDB.nombre,
                descripcion: marcaDB.descripcion,
                estado: marcaDB.estado,
                orden: marcaDB.orden,
                fechaCreacion: marcaDB.fechaCreacion,
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
// Actualizar marca
// ============================
router.put('/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    /* let body = req.body;
    let bodyMarca = { nombre: body.nombre, descripcion: body.descripcion, estado: body.estado }; */
    let bodyMarca = _.pick(req.body, ['nombre', 'descripcion', 'estado', 'orden']);
    Marca.findByIdAndUpdate(id, bodyMarca, { new: true, runValidators: false }, (err, marcaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar marca',
                errors: err
            });
        }
        if (!marcaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La marca con el id ' + id + ' no existe',
                errors: { message: 'No existe una marca con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            marca: marcaDB
        });
    });
});

// ==================================================
// Cambia estado a una marca 
// ==================================================
router.put('/estado/:id', [verificaToken], (req, res) => {

    let id = req.params.id;

    Marca.findById(id, (err, marcaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cambiar estado a la marca',
                errors: err
            });
        }
        if (!marcaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una marca con ese id',
                errors: { message: 'No existe una marca con ese id' }
            });
        }
        let estadoMensaje;
        if (marcaDB.estado == true) {
            marcaDB.estado = false;
            estadoMensaje = "DESACTIVADO";
        } else {
            marcaDB.estado = true;
            estadoMensaje = "ACTIVADO";
        }

        marcaDB.save((err, marcaBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                marca: marcaBorrado,
                mensaje: `Marca actualizada, nuevo estado '${estadoMensaje}'`
            });
        });
    });

});

// ============================
// Borrar marcas
// ============================
router.delete('/delete/:id', [verificaToken], (req, res) => {
    // solo un administrador puede borrar marcas
    // Marca.findByIdAndRemove
    let id = req.params.id;

    Marca.findByIdAndRemove(id, (err, marcaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar marca',
                errors: err
            });
        }
        if (!marcaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La marca con el id ' + id + ' no existe',
                errors: { message: 'No existe una marca con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Marca Borrada'
        });
    });
});

module.exports = router;