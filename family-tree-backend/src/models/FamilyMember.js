const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthDate: Date,
  gender: String,
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' }],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' }],
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);