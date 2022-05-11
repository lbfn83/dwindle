const express = require('express');
const router = express.Router();
const fs = require("fs");
const {company} = require('../models')

router.get('/setupCompanyListFromTxt', async (req, res) => {
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
        const queryData = data.map( elem => {
            return {"companyname": elem};
        })
        // console.log(queryData)
        company.bulkCreate(queryData);
    }catch(error)
    {
        console.log(`[testRouter] Err : `, error);
    }
});


module.exports = router