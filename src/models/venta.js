const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const ventaSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
});

ventaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('venta', ventaSchema);