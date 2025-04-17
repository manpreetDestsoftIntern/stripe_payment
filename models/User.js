const mongoose = require('mongoose');
module.exports = mongoose.model('User', {
  email: String,
  role: { type: String, default: 'member' },
  organizationId: mongoose.Schema.Types.ObjectId
});
