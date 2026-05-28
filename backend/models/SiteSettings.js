const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  logoUrl:  { type: String, default: null },
  publicId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);