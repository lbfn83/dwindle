const express = require('express');
const router = express.Router();
const pool = require('../db.js');

//  Insert DB module to populate data in an empty DB 
router.post('/subscribe', async (req, res) => {
    console.log("req" , req.body);
    // when request contains duplicate key value, server dies
    try{
        await pool.query("INSERT INTO subscriber(firstname, lastname, email) values($1, $2, $3);", 
         [req.body.firstname, req.body.lastname, req.body.email])
         res.status(200).send("new subscriber sucessfully registered. ")
    } 
    catch(error)
    {   
        //  'ERR_HTTP_INVALID_STATUS_CODE'  Invalid status code . put wrong argument at send function
        const errMsg = 'Error while registering new subscriber: ' + error
        res.status(400).send(errMsg);
    }
})

module.exports = router