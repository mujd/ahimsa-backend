const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var User = require('../models/usuario');
require("../config/config");
var user = {
    /* _id: mongoose.Types.ObjectId(), */
    _id: "5ac5cdf3532808df2e80281e",
    nombre: "Administrador",
    email: "admin@ahimsa.cl",
    password: bcrypt.hashSync(process.env.PASS, 10),
    role: "ADMIN_ROLE"
}
var queryOptions = {
    upsert: true,
    setDefaultsOnInsert: true,
    useFindAndModify: false
};

var id = user._id;
/* console.log(id); */
User.findByIdAndUpdate(id, user, queryOptions, function(e) {
    if (e) {
        throw e;
    }
    /* console.log('default user'); */
});
/* User.create(user, function(e) {
    if (e) {
        throw e;
    }
    console.log('new default user');
}); */