const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let fecha = new Date().toLocaleString();
const marcaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario.'] },
    descripcion: { type: String, required: false },
    estado: { type: Boolean, default: true },
    orden: { type: Number, default: 1 },
    fechaCreacion: { type: Date, default: fecha },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});
marcaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Marca', marcaSchema);