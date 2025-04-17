const mongoose = require('mongoose');
module.exports = mongoose.model('Payment', {
  orgId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  status: String,
  amount: Number,
  stripeInvoiceId: String
});
