const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;
module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticataed. ');
        error.statusCode = 401;
        throw error;
    }
    // convention is Bearer + token
    const jwtoken = authHeader.split(' ')[1];
    let decodeToken;
    try {
        decodeToken = jwt.verify(jwtoken, secret);
        // console.log('decoded : ', decodeToken)
        if(!decodeToken){
            const error = new Error('Not authenticated. ');
            error.statusCode = 401;
            throw error;
        }
        req.userId = decodeToken.userId;
        next();
    }
    catch(err)
    {
        // TODO : when throwing error here, it goes into express error handler directly?
        // as opposite to being error occurred in controller then it goes directly to process error handler
        // layer.js is has error handler that routes this to express defualt error handler
        // think it is only kicking in in case of middleware
        next(err);
        // throw err;
    }

}