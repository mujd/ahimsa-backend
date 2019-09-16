const bcrypt = require('bcryptjs');
const User = require('../models/usuario');
require("../config/config");

let user = {
    _id: "5ac5cdf3532808df2e80281e",
    nombre: "Admin",
    email: "admin@ahimsa.cl",
    password: bcrypt.hashSync(process.env.PASS, 10),
    role: "ADMIN_ROLE"
}
let queryOptions = {
    upsert: true,
    setDefaultsOnInsert: true,
    useFindAndModify: false
};
let id = user._id;
User.findByIdAndUpdate(id, user, queryOptions, function(e) {
    if (e) {
        throw e;
    }
});
/* User.create(user, function(e) {
    if (e) {
        throw e;
    }
    console.log('new default user');
}); */