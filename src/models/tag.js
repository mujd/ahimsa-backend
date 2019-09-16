const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario.'] }
});
tagSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Tag', tagSchema);