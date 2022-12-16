const express = require('express');
const router = express.Router();
const fs = require("fs");
const {logger} = require('../config/logger');
const {jobposting, company, sequelize} = require('../models');
const BENEFIT_TYPES = require('../static/benefit_type');
const {toHttp} = require('../util/toHttp');
const companyControllers = require('../controller/company')
const isAuth = require('../middleware/is-auth')


//give full list of companies. it doesn't yield any benefit information but only columns in company table
router.get('/companies', async (req, res, next) => {
  await companyControllers.getfullListCompanies(req, res, next);
});


router.put('/company', isAuth, async (req, res, next) => {
  await companyControllers.putCompany(req, res, next);
});

// soft delete company
router.delete('/company/:id', isAuth, async (req, res, next) => {
  await companyControllers.deleteCompany(req, res, next);
});

// Give out the list of companies that offers the same type of benefit specified in param
// the response will include the benefit information as well
router.get('/companies/benefit/:benefit_type', async (req, res, next) => {
  await companyControllers.getCompaniesWithSameBenefit(req, res, next);
});

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