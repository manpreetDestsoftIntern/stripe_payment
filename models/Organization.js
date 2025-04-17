const mongoose = require('mongoose');
module.exports = mongoose.model('Organization', {
  name: String,
  stripeCustomerId: String,
  stripeSubscriptionId: String
});
