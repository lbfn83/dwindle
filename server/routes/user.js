const express = require('express');
const router = express.Router();
const userControllers = require('../controller/user');

const { user } = require('../models')
const { body } = require('express-validator');


// Since this is about admin user account, 
// the below route should be commented out once registry is done
router.post('/signup',
    [
        body('id')
            // .isEmail()
            // .withMessage("Please enter a valid email. ")
            .custom((value, { req }) => {
                return user.findOne({
                    where: {
                        id: value
                    }
                })
                    .then(userRecord => {
                        if (userRecord) {
                            return Promise.reject('ID already in use.');
                        }
                    })
            }),
        // https://stackoverflow.com/questions/34760548/how-to-validate-password-using-express-validator-npm
        body('password')
            .trim()
            .isLength({ min: 6 })
            .withMessage('password must be at least 6 chars long. ')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{0,}$/, "g")
            // .matches(/^([0-9A-z\ \_]+)$/, "g")
            .withMessage('password must contain only at least one number, one lowercase, and one uppercase.')
    ],
    async (req, res, next) => {
        await userControllers.postSignup(req, res, next);
    }
)


router.post('/login', async (req, res, next) => {
    await userControllers.postLogin(req, res, next);
});

module.exports = router;