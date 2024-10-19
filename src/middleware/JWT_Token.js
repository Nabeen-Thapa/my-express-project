const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.jwt_secret;

//middleware for protection
export const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //split authHeader where request token is stored in the  "authorization: Bearer <token>" formlat it split this format and access token that is in 1 index of array 
    if (token == null) return res.status(401).json({ message: "missing token" });
    jwt.verify(token, jwt_secret, (err, user) => {
        if (err) return res.status(403).json({ message: "invalid token" });
        req.user = user;
        next();
    })
};