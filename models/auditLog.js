const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  uploadedBy: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  processedRows: { type: Number, required: true },
  success: { type: Boolean, default: true },
  errorMessages: [{ type: String }],
}, { timestamps: true });

auditSchema.index({ fileName: 1, uploadedAt: -1 });

module.exports = mongoose.model('AuditLog', auditSchema);
