const express = require('express');
const router = express.Router();
const fs = require("fs");

// Sequelize. db contains all the models defined
const db = require('../models')
const company = db.company
router.get('/setupCompanyListFromTxt', async (req, res) => {
    
    // console.log('[testRouter] request: ',req)
    try{
        const data = []
        const fileContent = fs.readFileSync('./data/company_list.txt', 'utf-8');
        fileContent.split(/\r?\n/).forEach(line =>  {
            if(line != "")
            {
                const trimedWord  = line.trim();
                data.push(trimedWord)
                // console.log(`[testRouter] Line from file: ${trimedWord}`);
            }
          });

        const dbEntries = data.map( elem => {
            return {"companyname": elem};
        })

        // console.log(dbEntries)
        // What is bulkCreate's return? some sequelize auto created field with dbEntries
        await company.bulkCreate(dbEntries);
        // console.log(`[testRouter] bulkInsert result : `, result);
        return res.status(200).json(dbEntries);
    }catch(error)
    {
        // console.log(`[testRouter] Err : `, error);
        // 500 Internal Server Error
        // 400 Bad Request
        return res.status(500).json({message : error})
    }
});


module.exports = router