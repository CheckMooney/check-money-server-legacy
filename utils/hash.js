const bcrypt = require('bcryptjs');

exports.getHash = async password => {
  try {
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch {
    console.log(err);
  }
};

exports.compareHash = async (password, db_password) => {
  try {
    const result = await bcrypt.compare(password, db_password);
    return result;
  } catch {
    console.log(err);
  }
};
