const express = require('express');
const { logger } = require('../config/logger.js');
const router = express.Router();
const pool = require('../config/pgLibDBconfig.js');
const { subscriber } = require('../models');
const { addEmailSubscriber } = require('../service/addEmailSubscriber')


// firstname and lastname are redundant but just leave them here for future 
router.post('/subscribe', async (req, res) => {
    // it would be too much info if it is 'info' level
    logger.debug(`[subscribeRouter] req : ${req.body}`);
    try {
        //  [req.body.firstname, req.body.lastname, req.body.email])
        const { firstname = "", lastname = "", email } = req.body;

        const message = await addEmailSubscriber(email);

        /* Obsolete codes */
        // when request contains duplicate key value, server dies => Use Upsert
        // await subscriber.create({firstname, lastname, email });

        // https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-upsert/
        await pool.query(`INSERT INTO subscriber(firstname, lastname, email, "createdAt", "updatedAt") values('${firstname}', '${lastname}', '${email}', NOW(), NOW()) 
        ON CONFLICT(email) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname ,email = EXCLUDED.email, "updatedAt" = NOW()`);
        res.status(200).send(message);
        // res.status(200).send("new subscriber sucessfully registered. ");
    }
    catch (error) {
        // error message structure
        //  {"length":293,"name":"error","severity":"ERROR","code":"23505","detail":"Key (email)=(rrr6@jalsdf3.com) already exists.","schema":"public","table":"subscriber","constraint":"subscriber_email_key","file":"d:\\pginstaller_12.auto\\postgres.windows-x64\\src\\backend\\access\\nbtree\\nbtinsert.c","line":"570","routine":"_bt_check_unique"}
        // JSON.stringify(error)
        //  23505 error code duplicate key value

        // console.log("router err: " , JSON.stringify(error.code).includes("23505"))
        // if(JSON.stringify(error.code).includes("23505"))
        // {
        //     res.status(200).send("duplicate email but I guess it is okay");    
        // }else{    

        const errMsg = 'Error while registering new subscriber: ' + error;
        logger.error(`[subscribeRouter] err : ${errMsg} / request body param : ${JSON.stringify(req.body)}`)
        //  'ERR_HTTP_INVALID_STATUS_CODE'  Invalid status code . put wrong argument at send function
        res.status(400).send(errMsg);


    }
});



/* Obsolete as MailChimp account has its own database of subscribers.
Being managed by the owner of the account seems like a best idea

//No need to change it to sequelize since it is behaving as expected 
router.get('/subscribe', async (req, res) => {
    const result = await pool.query("Select * from subscriber;");
    const rows = result.rows;
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows));
});

router.delete('/subscribe', async(req, res) => {
    try{
        await pool.query("delete from subscriber where id = $1", [req.body.id]);
        res.status(200).send("Subscriber Deletion Success");
    }catch(error)
    {
        res.status(400).send(`Subscriber Deletion failed : ${error}`);
    }
})
*/

module.exports = router;