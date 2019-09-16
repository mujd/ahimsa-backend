const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let fecha = new Date().toLocaleString();
const testimonioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario.'] },
    testimonio: { type: String, required: [true, 'El testimonio es necesario.'] },
    estado: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: fecha }
});
testimonioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Testimonio', testimonioSchema);