const express = require('express');
const router = express.Router();
const fs = require("fs");
const {jobposting, company} = require('../models');
const {setupCompanyListFromTxt} = require('../controllers/companyListInit')
const {toHttp} = require('../util/toHttp')

//give full list of companies
router.get('/company', async (req, res) => {
    try {
      const companyList = await company.findAll()
  
      return res.json(companyList)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: `Something went wrong: ${err}` })

    }
  })

// returns all the job postings that falls under a certain comapny name
// plase note that it returns all of jobpostings from every location
router.get('/company/:uuid', async (req, res) => {
    const uuid = req.params.uuid
    try {
      const user = await company.findOne({
        where: { uuid },
        // I did freeze table but wht it takes plural in association name?
        // find out how other people freezetable in each model to see if it works
        include: 'jobpostings',
      })
  
      return res.json(user)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: `Something went wrong: ${err}` })

    }
  })
router.get('/setupCompanyListFromTxt2/', async (req, res) => {
    await toHttp(setupCompanyListFromTxt, req, res)
  }
)

router.get('/setupCompanyListFromTxt/', async (req, res) => {

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
        // TODO : change into upsert
        await company.bulkCreate(dbEntries, {
            updateOnDuplicate: ['companyname']
          });
        // console.log(`[testRouter] bulkInsert result : `, result);
        return res.status(200).json(dbEntries);
    }catch(error)
    {
        // console.log(`[testRouter] Err : `, error);
        // 500 Internal Server Error
        // 400 Bad Request
        return res.status(500).json({ ErrorMessage : error})
    }
});



module.exports = router