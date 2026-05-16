const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && !process.env[key]) process.env[key] = val;
    });
}

loadEnvFile(path.join(__dirname, '..', '.env.local'));
loadEnvFile(path.join(__dirname, '..', '.env'));

const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
    isVerified: Boolean,
    status: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function check() {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    const users = await User.find({}, 'email role isVerified status');
    console.log('Users in DB:', JSON.stringify(users, null, 2));
    await mongoose.disconnect();
}

check().catch(console.error);
