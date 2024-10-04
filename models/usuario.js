const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    contrasena: { type: String, required: true },
    email: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
});

const Usuario = mongoose.model('Usuario', userSchema);

module.exports = Usuario;
