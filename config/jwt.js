let jwtobj = {};
jwtobj.secret = process.env.JWT_SECRET || "test";
module.exports = jwtobj;