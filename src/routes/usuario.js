const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole, verificaAdminMismoUsuario } = require('../middlewares/autenticacion');

// ==================================================
// Obtener todos los usuarios
// ==================================================
router.get('/', verificaToken, (req, res) => {
    let perPage = req.query.perPage || 10;
    perPage = Number(perPage);
    let page = req.query.page || 1;
    page = Math.max(0, page);
    page = Number(page);
    Usuario.find({}, 'nombre email role estado fechaCreacion')
        /* .skip((perPage * page) - perPage)
        .limit(perPage) */
        .sort({ fechaCreacion: 'asc' })
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    error: err
                });
            }
            Usuario.countDocuments((err, conteo) => {
                res.status(200).json({
                    ok: true,
                    usuarios,
                    /* current_page: page,
                    total_pages: Math.ceil(conteo / perPage), */
                    total_usuarios: conteo
                });
            });
        });
});
// ============================
// Mostrar un usuario por ID
// ============================
router.get('/:id', verificaToken, (req, res) => {
    //Usuario.findById();
    let id = req.params.id;
    Usuario.findById(id, 'nombre email role estado fechaCreacion')
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id ' + id + ' no existe',
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                usuario: usuarioDB
            });
        });
});
// ==================================================
// Crear un nuevo usuario
// ==================================================
/* router.post('/usuario', function(req, res) { */
router.post('/', [verificaToken, verificaAdminRole], function(req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        role: body.role,
        password: bcrypt.hashSync(body.password, 10)
    });
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                error: err
            });
        }
        /* usuarioDB.password = null; */
        res.status(201).json({
            ok: true,
            usuario_nuevo: usuarioDB,
            creado_por: {
                nombre: req.usuario.nombre,
                email: req.usuario.email
            }
        });
    });
});

// ==================================================
// Actualizar un usuario
// ==================================================
router.put('/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'role', 'estado']);

    let opcion = { email: body.email };
    Usuario.find(opcion).exec((err, usuarios) => {
        console.log(usuarios);
        if (usuarios) {
            console.log('Email existe');
        } else {
            console.log('Email No existe');
        }
    });
    Usuario.findByIdAndUpdate(id, body, { runValidators: false }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id "${id}" no existe`,
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario_actualizado: usuarioDB
        });
    });
});

// ==================================================
// Borrar un usuario por el id
// ==================================================
router.delete('/delete/:id', [verificaToken, verificaAdminRole], (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: `El usuario '${usuarioBorrado.nombre}' fue borrado con exito`
        });
    });
});

// ==================================================
// Cambia estado a un usuario 
// ==================================================
router.put('/estado/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cambiar estado al usuario',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }
        let estadoMensaje;
        if (usuarioDB.estado == true) {
            usuarioDB.estado = false;
            estadoMensaje = "DESACTIVADO";
        } else {
            usuarioDB.estado = true;
            estadoMensaje = "ACTIVADO";
        }

        usuarioDB.save((err, usuarioBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                usuario: usuarioBorrado,
                mensaje: `Usuario actualizado, nuevo estado '${estadoMensaje}'`
            });
        });
    });

});
// ==================================================
// Cambiar contraseña usuario
// ==================================================
router.put('/cambiar-password/:id', [verificaToken, verificaAdminMismoUsuario], (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Contraseñas no coinciden!!' },
                mensaje: 'Esta no es su contraseña antigua, ingrese los datos correctamente.'
            });
        }
        usuario.password = bcrypt.hashSync(body.passwordNueva, 10);

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la contraseña',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: `Usuario '${usuarioGuardado.nombre}' cambio contraseña con exito`
            });
        });
    });
});

module.exports = router;