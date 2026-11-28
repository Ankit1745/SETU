const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  customId: { type: String, unique: true, required: true },
  type: { type: String, default: 'INFO' }, // BOOKING_CREATED, KYC_APPROVED, NEW_MATERIAL, NEW_CONTRACTOR, ADMIN_BROADCAST, SYSTEM_ALERT
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRole: { type: String, default: 'ALL' }, // ALL | CUSTOMER | CONTRACTOR | VENDOR | ADMIN
  targetUserId: { type: String, default: '' },
  targetPhone: { type: String, default: '' },
  readByKeys: [{ type: String }],
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
