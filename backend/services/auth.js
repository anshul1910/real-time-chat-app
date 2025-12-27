const jwt = require('jsonwebtoken');

const SecretKey = "HomeAlone";

function setUser(user) {
    return jwt.sign({
        _id: user.id,
        username: user.userName,
        email: user.email
    }, SecretKey);
}

module.exports = {
    setUser,
}