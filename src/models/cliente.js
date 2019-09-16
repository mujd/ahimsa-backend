const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['CLIENT_ROLE', 'VISIT_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let fecha = new Date().toLocaleString();

let clienteSchema = new Schema({
    email: { type: String, unique: true, lowercase: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es obligatoria'] },
    picture: { type: String, required: false },
    estado: { type: Boolean, required: true, default: true },
    fechaCreacion: { type: Date, default: fecha },
    role: { type: String, required: true, default: 'CLIENT_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false },
    facebook: { type: Boolean, default: false },
    nombre: { type: String, required: false },
    fechaNacimiento: { type: Date, required: false },
    direccion: { type: String, required: false },
    comuna: { type: String, required: false },
    calle: { type: String, required: false },
    numeroCalle: { type: String, required: false },
    numeroCasa: { type: String, required: false },
    direccionReferencia: { type: String, required: false },
    codigoPostal: { type: String, required: false },
    fonoUno: { type: String, required: false },
    fonoDos: { type: String, required: false }
});

clienteSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

clienteSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Cliente', clienteSchema);