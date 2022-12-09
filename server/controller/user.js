const { user } = require('../models')
const bcrypt = require('bcryptjs');
const { validationResult, Result } = require('express-validator');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

// PUT doens't seem to fit in this context
// TODO: also validation should be implemented here
/** @type {import("express").RequestHandler} */
exports.postSignup = async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const errMsg = [];

        err.errors.forEach((element, index) => {
            errMsg.push({ [element.param]: element.msg })
        });

        const errValidation = new Error();
        errValidation.message = errMsg;
        errValidation.statusCode = 401;
        next(errValidation);

    }
    const id_ = req.body.id;
    const password = req.body.password;
    const salt = await bcrypt.genSalt(12);
    await bcrypt
        .hash( password, salt)
        .then(async(hashedPWD) => {
     
            await user.create({id: id_, password : hashedPWD})
                .then(user => {
                    // console.log(user);
                    res.status(200).json({ message : 'admin user created' , userId : user.id});
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });


}
// How to see express autocomplete
/** @type {import("express").RequestHandler} */
exports.postLogin = async (req, res, next) => {

    const id_ = req.body.id;
    const password = req.body.password;
    let loadedUser;

    await user.findOne({
        where: {
            id: id_
        }
    })
        .then(foundUser => {
            if (!foundUser) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                // if you throw Error directly without catch statement, process uncaught listner will be invoked it instead 
                throw error;
            }
            loadedUser = foundUser;
            return bcrypt.compare(password, loadedUser.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error("Wrong password!");
                error.statusCode = 401;
                throw error;
            }
            // loadedUser is not a plan object, so dataValues property should be specified => loadedUser.dataValues
            // or create your own object with only required fields
            const jwtToken = jwt.sign({ 
                    id : loadedUser.id,
                    password : loadedUser.password    
                }
                , secret,  {expiresIn : '1h'});

            res.status(200).json({ token: jwtToken, id: loadedUser.id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            // throw err;
            next(err);
        });
}