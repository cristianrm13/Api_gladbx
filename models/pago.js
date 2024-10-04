const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  status: { type: String, required: true },
  statusDetail: { type: String, required: true },
  amount: { type: Number, required: true },
  dateApproved: { type: Date },
  payerEmail: { type: String },
  description: { type: String }
});

const Pago = mongoose.model('Pago', pagoSchema);

module.exports = Pago;
