const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let fecha = new Date().toLocaleString();
let sku = 'AH-';
sku += Math.floor(10000 + Math.random() * 90000);

const productoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    precio: { type: Number, default: 0 },
    descripcion: { type: String, required: [true, 'La descripcion es necesaria'] },
    ingredientes: { type: Array, required: [true, 'Los ingredientes son necesarios'] },
    imagenPrincipal: { type: String, required: false },
    imagenes: { type: Array, required: false },
    estado: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: fecha },
    sku: { type: String, default: sku },
    orden: { type: Number, default: 1 },
    marca: { type: Schema.Types.ObjectId, ref: 'Marca', required: false },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria' },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Producto', productoSchema);