import jwt from 'jsonwebtoken';
const secretKey = 'your_secret_key';

const checkAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secretKey, (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                res.locals.user = decodedToken;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

export default checkAuth;