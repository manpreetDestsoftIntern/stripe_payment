const mongoose = require('mongoose');
module.exports = mongoose.model('CheckoutSession', {
  sessionId: String,
  orgId: mongoose.Schema.Types.ObjectId,
  status: String,
  createdAt: { type: Date, default: Date.now }
});
