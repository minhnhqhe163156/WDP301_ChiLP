const jwt = require('jsonwebtoken');
module.exports.createToken =  async (data) => {
    const token = await jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
    return token;
}