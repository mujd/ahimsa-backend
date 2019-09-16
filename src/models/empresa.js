const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let fecha = new Date().toLocaleString();
const empresaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario.'] },
    nombreCorto: { type: String, required: false },
    descripcion: { type: String, required: false },
    facebook: { type: String, required: false },
    instagram: { type: String, required: false },
    twitter: { type: String, required: false },
    direccion: { type: String, required: false },
    fonoUno: { type: String, required: false },
    fonoDos: { type: String, required: false }
});
empresaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Empresa', empresaSchema);