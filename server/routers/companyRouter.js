const express = require('express');
const router = express.Router();
const fs = require("fs");
const {logger} = require('../config/logger');
const {jobposting, company, sequelize} = require('../models');
const BENEFIT_TYPES = require('../static/benefit_type');
const {toHttp} = require('../util/toHttp');


//give full list of companies. it doesn't yield any benefit information but only columns in company table
router.get('/companies', async (req, res) => {
    try {
      
      const companyList = await company.findAll({paranoid : false})
  
      return res.json(companyList)
    } catch (err) {
      logger.error(`[comapnies router:get] Error : ${err}`);
      return res.status(500).json({ error: `Something went wrong: ${err}` })

    }
})

// Give out the list of companies that offers the same type of benefit specified in param
// the response will include the benefit information as well
router.get('/companies/benefit/:benefit_type', async (req, res) => {
  try {
    const benefit_type = req.params.benefit_type;
   
    // const total_benefit_type = ['student_loan_repayment', 'tuition_assistance', 'tuition_reimbursement', 'full_tuition_coverage'];
    
    // https://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
    // Javascript's IN Operator Does Not Work With Strings
    // exclude soft-deleted entries/ paranoid option on in a raw query
    if(BENEFIT_TYPES.indexOf(benefit_type) > -1 ){
      const queryResult = await sequelize.query(`SELECT company.*, benefit.benefit_type, benefit.benefit_details, benefit.link_to_benefit_details 
                            FROM company INNER JOIN benefit on company.company_name = benefit.company_name 
                            where benefit.benefit_type = '${benefit_type}' and "company"."deletedAt" is null and "benefit"."deletedAt" is null
                             order by company.company_name asc`);
      logger.debug(`[comapnies/benefit router:get] benefit type "${benefit_type}" // number of companies sent : [${queryResult[0].length}]`);
      return res.json(queryResult[0]);
    }else{
      logger.error(`[comapnies/benefit router:get] Error :  benefit type "${benefit_type}" is not defined  in [${total_benefit_type}]`);
      return res.status(500).json({ error: `benefit type "${benefit_type}" is not defined  in [${total_benefit_type}]` });
    }
  } catch (err) {
    logger.error(`[comapnies/benefit router:get] Error : ${err}`);
    return res.status(500).json({ error: `Something went wrong: ${err}` })

  }
})

/*********************************************** */

router.get('/company/:companyName', async (req, res) => {
  try {
    const company_name = req.params.companyName
    const queryResult = await company.findOne({
      where : {company_name}
    })

    return res.json(queryResult)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: `Something went wrong: ${err}` })

  }
})  

router.post('/company/', async (req, res) => {
  const { company_name, job_scraper, company_website, industry, imagelink, company_summary, company_description } = req.body

  try {
    const newCompany = await company.create({ company_name, job_scraper, company_website, industry, imagelink, company_summary, company_description })

    return res.json(newCompany)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})
//this is built for hard-deletion
// https://sequelize.org/docs/v6/core-concepts/paranoid/
router.delete('/company/:companyName', async (req, res) => {
  const company_name = req.params.companyName
  try {
    const queryResult = await company.findOne({ 
      where: { company_name },
      paranoid : false 
    })

    await queryResult.destroy({force: true})

    return res.json({ message: `company ${JSON.stringify(queryResult)} deleted!` })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
})
// TODO : Implement PUT for update  


// returns all the job postings that falls under a certain comapny name
// plase note that it returns all of jobpostings from every location
router.get('/company/:companyName/jobposting', async (req, res) => {
    const company_name = req.params.companyName
    try {
      const queryResult = await company.findOne({
        where: { company_name },
        // I did freeze table but wht it takes plural in association name?
        // find out how other people freezetable in each model to see if it works
        include: 'jobpostings',
      })
  
      return res.json(queryResult)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: `Something went wrong: ${err}` })

    }
})
router.get('/company/:companyName/benefit', async (req, res) => {
  const company_name = req.params.companyName
  try {
    const queryResult = await company.findOne({
      where: { company_name },
      // I did freeze table but wht it takes plural in association name?
      // find out how other people freezetable in each model to see if it works
      include: 'benefits',
    })

    return res.json(queryResult)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: `Something went wrong: ${err}` })

  }
})

// TODO : implement put, post
// router.put('/company/:companyName/benefit/', async (req, res) => {
//   try {
//     const benefit_type = req.params.benefit_type
//     const total_benefit_type = ['student_loan_repayment', 'tuition_assistance', 'tuition_reimbursement', 'full_tuition_coverage']
//     // https://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
//     // Javascript's IN Operator Does Not Work With Strings
//     if(total_benefit_type.indexOf(benefit_type) > -1 ){
//       const queryResult = await sequelize.query(`SELECT company.*, benefit.benefit_type, benefit.benefit_details, benefit.link_to_benefit_details 
//                             FROM company INNER JOIN benefit on company.company_name = benefit.company_name 
//                             where benefit.benefit_type = '${benefit_type}' order by company.company_name asc`)
  
//       return res.json(queryResult)
//     }else{
//       return res.status(500).json({ error: `benefit type "${benefit_type}" is not defined  in [${total_benefit_type}]` })
//     }
//   } catch (err) {
//     console.log(err)
//     return res.status(500).json({ error: `Something went wrong: ${err}` })

//   }
// })




module.exports = router