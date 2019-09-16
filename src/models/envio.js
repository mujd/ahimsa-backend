const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let fecha = new Date().toLocaleString();
const envioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario.'] },
    descripcion: { type: String, required: [true, 'El envio es necesario.'] },
    estado: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: fecha },
    monto: { type: Number, default: 3000 }
});
envioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Envio', envioSchema);