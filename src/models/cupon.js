const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let fecha = new Date().toLocaleString();
const cuponSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario.'] },
    estado: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: fecha },
    fechaExpiracion: { type: Date, required: false },
    valor: { type: Number, default: 0 }
});
cuponSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Cupon', cuponSchema);