const jwt = require('jsonwebtoken');
const config = require('config');

const { Account } = require('../model/account');

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decode = await jwt.decode(token, config.get('tokenKey'));
        const user = await Account.findOne({ _id: decode._id, 'tokens.token': token });
        if (!user) {
            throw new Error('User session timeout');
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (e) {
        console.log(e);
        res.status(401).send({ 'Error': 'Please authendicate' });
    }
}

module.exports=auth;