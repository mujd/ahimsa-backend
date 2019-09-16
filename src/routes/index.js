const express = require('express');
const router = express.Router();

/* rutas administración */
router.use('/usuario', require('./usuario'));
router.use('/login', require('./login'));
router.use('/categoria', require('./categoria'));
router.use('/producto', require('./producto'));
router.use('/sucursal', require('./sucursal'));
router.use('/marca', require('./marca'));
router.use('/busqueda', require('./busqueda'));
router.use('/upload', require('./upload'));
router.use('/uploadImagenes', require('./uploadImagenes'));
router.use('/img', require('./imagenes'));
/* rutas cliente */
router.use('/cliente', require('./cliente'));

module.exports = router;