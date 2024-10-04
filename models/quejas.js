const mongoose = require('mongoose');

const quejaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'Pendiente' },
    dateCreated: { type: Date, default: Date.now },
});

const Quejas = mongoose.model('Quejas', quejaSchema);

module.exports = Quejas;
