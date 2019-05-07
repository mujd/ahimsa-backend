const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario.'] },
    descripcion: { type: String, required: [true, 'La descripción es necesaria.'] },
    img: { type: String, required: false },
    estado: { type: Boolean, default: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});
categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Categoria', categoriaSchema);