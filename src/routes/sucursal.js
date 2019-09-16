const express = require('express');
const router = express.Router();
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const Sucursal = require('../models/sucursal');
const Usuario = require('../models/usuario');

// ============================
// Mostrar todos los sucursales
// ============================
router.get('/', verificaToken, async(req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    try {
        const sucursales = await Sucursal.find({}, 'nombre direccion comuna')
            .skip(desde)
            .limit(limite)
            .populate('usuario', 'nombre email')
            .exec();
        Sucursal.countDocuments({}, (err, conteo) => {
            res.status(200).json({
                ok: true,
                sucursales,
                total: conteo
            });
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar sucursal',
            error: err
        });
    }
});

// ============================
// Mostrar sucursal por id
// ============================
router.get('/:id', verificaToken, async(req, res) => {
    let id = req.params.id;
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    let order = {};
    if (req.query.order == 'asc') {
        order = { order: 'asc' };
    } else {
        order = { order: 'desc' };
    }
    try {
        let sucursales = await Sucursal.findById(id)
            .sort(order)
            .skip(desde)
            .limit(limite)
            .populate('usuario', 'nombre email')
            .exec();
        res.status(200).json({
            ok: true,
            sucursales
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar sucursal',
            error: err
        });
    }
});

// ======================
// GET sucursales by user
// ======================
router.get('/user/:id', verificaToken, async(req, res) => {
    try {
        let sucursales;
        if (req.query.term) {
            let regExpTerm = new RegExp(req.query.term, 'i');
            let regExpSearch = [{ nombre: { $regex: regExpTerm } }, { direccion: { $regex: regExpTerm } }, { comuna: { $regex: regExpTerm } }];
            sucursales = await Sucursal.find({ usuario: req.params.id })
                .or(regExpSearch)
                .populate('usuario', 'nombre email')
                .exec();
        } else {
            // no filter - all sucursales
            sucursales = await Sucursal.find({ usuario: req.params.id })
                .populate('usuario', 'nombre email')
                .exec();
        }
        Sucursal.countDocuments({}, (err, conteo) => {
            res.status(200).json({
                ok: true,
                sucursales,
                total: conteo
            });
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar sucursal',
            error: err
        });
    }
});
// ======================
// Nueva sucursal
// ======================
router.post('/', verificaToken, async(req, res) => {
    usuarioId = req.usuario._id
    const body = req.body;
    const sucursal = new Sucursal({
        nombre: body.nombre,
        direccion: body.direccion,
        comuna: body.comuna,
        usuario: req.usuario._id
    });
    console.log(sucursal);
    try {
        let usuarioMensaje;
        Usuario.findById(usuarioId).exec((err, usuarioDB) => {
            if (err) {
                return res.status(500).json({ ok: false, error: err });
            }
            usuarioMensaje = usuarioDB;
        });
        let newSucursal = await sucursal.save();
        res.status(201).json({
            ok: true,
            sucursal: newSucursal,
            creado_por: {
                usuario_id: usuarioMensaje._id,
                usuario_nombre: usuarioMensaje.nombre,
                usuario_email: usuarioMensaje.email
            }
        });
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            // res.status(409).send(new MyError('Duplicate key', [err.message]));
            return res.status(409).json({
                ok: false,
                mensaje: 'Error al crear la sucursal.',
                error: err
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al crear la sucursal.',
            error: err
        });
    }
});

// ============================
// Actualizar sucursal
// ============================
router.put('/:id', verificaToken, async(req, res) => {
    let id = req.params.id;
    let bodySucursal = _.pick(req.body, ['nombre', 'direccion', 'comuna']);
    let sucursal;
    try {
        sucursal = await Sucursal.findByIdAndUpdate(id, bodySucursal, { new: true, runValidators: false });
        res.status(200).json({
            ok: true,
            sucursal: sucursal
        });
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            return res.status(409).json({ ok: false, error: err });
        }
        if (!sucursal) {
            return res.status(404).json({ ok: false, mensaje: 'La sucursal con el id ' + id + ' no existe', error: { mensaje: 'No existe una sucursal con ese ID' }, err });
        }
        res.status(500).json({ ok: false, mensaje: 'Error al crear la sucursal.', error: err });
    }
});

// ============================
// Borrar sucursales
// ============================
router.delete('/:id', [verificaToken], async(req, res) => {
    // solo un administrador puede borrar sucursales
    // Sucursal.findByIdAndRemove
    let id = req.params.id;
    let sucursal;
    try {
        sucursal = await Sucursal.findByIdAndRemove(id);
        res.status(200).json({
            ok: true,
            message: 'Sucursal Borrada exitosamente!',
            sucursal
        });
    } catch (err) {
        if (!sucursal) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La sucursal con el id ' + id + ' no existe',
                error: { message: 'No existe una sucursal con ese ID' },
                err
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar sucursal',
                error: err
            });
        }
    }
});
module.exports = router;