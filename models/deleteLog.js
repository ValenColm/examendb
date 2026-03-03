const mongoose = require('mongoose');

const deleteLogSchema = new mongoose.Schema({
  entity: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.Mixed, required: true },
  deletedAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed },
});

module.exports = mongoose.model('DeleteLog', deleteLogSchema);
