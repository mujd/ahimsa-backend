const express = require('express');
const router = express.Router();
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');
const Marca = require('../models/marca');
const Usuario = require('../models/usuario');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './src/uploads/productos/');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }

    /* filename: function(req, file, callback) {
        callback(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    } */
});
const fileFilter = (req, file, callback) => {
    /* if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(null, false);
    } */
    checkFileType(file, callback);
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});
// Check File Type
function checkFileType(file, callback) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return callback(null, true);
    } else {
        callback('Error: Imagenes Solamente!');
        /* callback(null, false); */
    }
}


// ============================
// Mostrar todos los productos
// ============================
router.get('/', verificaToken, (req, res) => {
    let perPage = req.query.perPage || 10;
    perPage = Number(perPage);
    let page = req.query.page || 1;
    page = Math.max(0, page);
    page = Number(page);
    /* let page = Math.max(0, req.param('page')) */
    Producto.find({}, '_id nombre descripcion precio ingredientes imagenes estado marca categoria usuario')
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort({ orden: 'asc' })
        .populate('marca', 'nombre descripcion')
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
                    current_page: page,
                    total_pages: Math.ceil(conteo / perPage),
                    total_productos: conteo
                });
            });

        });
});

// ============================
// Mostrar todas las productos por estado
// ============================
router.get('/estado/:estado', verificaToken, (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = Math.max(0, req.query.page);
    let estado = req.params.estado;
    let opcion = {};
    if (req.params.estado == 'true') {
        opcion = { estado: true };
    } else {
        opcion = { estado: false };
    }
    Producto.find(opcion, '_id nombre descripcion precio ingredientes imagenes estado marca categoria usuario')
        .limit(perPage)
        .skip(perPage * page)
        .sort({ orden: 'asc' })
        .populate('marca', 'nombre descripcion')
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

            Producto.countDocuments({ estado: true }, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    productos,
                    page: page,
                    pages: conteo / perPage,
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
        .select('_id nombre descripcion precio ingredientes imagenes estado marca categoria usuario')
        .populate('marca', 'nombre descripcion')
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
/* router.post('/', upload.array('imagenes', 2), verificaToken, (req, res) => { */
router.post('/', upload.single('imagenes'), verificaToken, (req, res) => {
    /* console.log(req.files); */
    usuarioId = req.usuario._id
    let body = req.body; //Obtener el body
    let imageName = "";

    if (req.files) {
        imageName = req.file.path.split('\\')[3];
    } else {
        imageName = req.body.imagenes;
    }

    let producto = new Producto({
        nombre: body.nombre,
        precio: body.precio,
        descripcion: body.descripcion,
        marca: body.marca,
        ingredientes: body.ingredientes,
        /* imagenes: imageName, */
        /* imagenes: req.file.path.split('\\')[3] || req.body.imagenes, */
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
    let marcaMensaje;
    Marca.findById(body.marca).exec((err, marcaDB) => {
        if (err) {
            return res.status(500).json({ ok: false, errors: err });
        }
        marcaMensaje = marcaDB;
    });
    let usuarioMensaje;
    Usuario.findById(usuarioId).exec((err, usuarioDB) => {
        if (err) {
            return res.status(500).json({ ok: false, errors: err });
        }
        usuarioMensaje = usuarioDB;
    });
    producto.save((err, productoDB) => {
        /* producto.save({ new: true, runValidators: false }, (err, productoDB) => { */
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
                mensaje: 'Error al crear productos',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            /* producto: productoDB, */
            producto: {
                _id: productoDB.id,
                nombre: productoDB.nombre,
                descripcion: productoDB.descripcion,
                precio: productoDB.precio,
                estado: productoDB.estado,
                ingredientes: productoDB.ingredientes
            },
            marca: {
                id: marcaMensaje._id,
                nombre: marcaMensaje.nombre
            },
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
    let bodyProducto = _.pick(req.body, ['nombre', 'precio', 'descripcion', 'ingredientes', 'marca', 'categoria', 'estado']);
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
        if (productoDB.estado == true) {
            productoDB.estado = false;
            disponibleMensaje = "NO-DISPONIBLE";
        } else {
            productoDB.estado = true;
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
/* Producto.collection.distinct("nombre", function(error, results) { */
/* Producto.distinct("nombre", function(error, results) {
    console.log(results);
});
Producto.find().distinct('ingredientes', function(error, ids) {
    
    console.log(ids);
    console.log(error);
}); */
/* router.get('/', (req, res) => {
    Article.distinct('title', function(error, titles) { //see the use of distinct
      if (err) {
         console.log(err);
      } else {
        console.log(articles);
        res.render('index', {
           title: 'Articles',
           articles: titles
        });
      }
    });
  }); */
module.exports = router;