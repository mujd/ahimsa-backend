const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const sucursalSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    direccion: { type: String, required: [true, 'La direccion es necesaria'] },
    comuna: { type: String, required: [true, 'La comuna es necesaria'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'sucursales' });

sucursalSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Sucursal', sucursalSchema);