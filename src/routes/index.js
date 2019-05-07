const router = require('express').Router();

router.use('/usuario', require('./usuario'));
router.use('/login', require('./login'));
router.use('/categoria', require('./categoria'));
router.use('/producto', require('./producto'));
router.use('/sucursal', require('./sucursal'));
router.use('/busqueda', require('./busqueda'));
router.use('/upload', require('./upload'));
router.use('/img', require('./imagenes'));

module.exports = router;