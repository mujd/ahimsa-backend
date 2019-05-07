const router = require('express').Router();
const _ = require('underscore');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let Sucursal = require('../models/sucursal');


// ============================
// Mostrar todos los sucursales
// ============================
router.get('/', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Sucursal.find({}, 'nombre direccion comuna')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email role')
        .exec((err, sucursales) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando sucursales',
                    error: err
                });
            }
            Sucursal.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    sucursales,
                    total: conteo
                });
            });

        });
});

// ============================
// Crear nueva sucursal
// ============================
router.post('/', verificaToken, (req, res) => {
    // regresa la nueva sucursal
    usuarioId = req.usuario._id
    let body = req.body; //Obtener el body

    let sucursal = new Sucursal({
        nombre: body.nombre,
        direccion: body.precioUnitario,
        comuna: body.descripcion,
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
    sucursal.save((err, sucursalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear sucursal',
                errors: err
            });
        }
        if (!sucursalDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear sucursal',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            sucursal: sucursalDB,
            creado_por: {
                usuario_id: usuarioMensaje._id,
                usuario_nombre: usuarioMensaje.nombre,
                usuario_email: usuarioMensaje.email
            }
        });
    });
});

// ============================
// Actualizar sucursal
// ============================
router.put('/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let bodySucursal = _.pick(req.body, ['nombre', 'direccion', 'comuna']);
    Sucursal.findByIdAndUpdate(id, bodySucursal, { new: true, runValidators: false }, (err, sucursalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar sucursal',
                errors: err
            });
        }
        if (!sucursalDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El sucursal con el id ' + id + ' no existe',
                errors: { message: 'No existe un sucursal con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            sucursal: sucursalDB
        });
    });
});

// ============================
// Borrar sucursales
// ============================
router.delete('/delete/:id', [verificaToken], (req, res) => {
    // solo un administrador puede borrar sucursales
    // Sucursal.findByIdAndRemove
    let id = req.params.id;

    Sucursal.findByIdAndRemove(id, (err, sucursalBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar sucursal',
                errors: err
            });
        }
        if (!sucursalBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La sucursal con el id ' + id + ' no existe',
                errors: { message: 'No existe una sucursal con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Sucursal Borrada exitosamente!'
        });
    });
});

module.exports = router;