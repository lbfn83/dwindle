const express = require('express');
const router = express.Router();
const fs = require("fs");
const { Op, Model } = require('sequelize');
const { logger } = require('../config/logger');
const { jobposting, company, benefit, sequelize, Sequelize } = require('../models');
const op = Sequelize.Op;
const BENEFIT_TYPES = require('../static/benefit_type');
const { toHttp } = require('../util/toHttp');


//give full list of companies. it doesn't yield any benefit information but only columns in company table
/** @type {import("express").RequestHandler} */
exports.getfullListCompanies = async (req, res, next) => {
  // paranoid excludes soft-deleted records
  await company.findAll({ paranoid: true })
    .then(companyList => {
      res.status(200).json(companyList);
    })
    .catch(error => {
      error.message = `[${error.name || 'Database'}] ${error.message}`
      // internal server error
      error.statusCode = 500;
      next(error);
    });
};

/** @type {import("express").RequestHandler} */
exports.putCompany = async (req, res, next) => {
  const { company_name, job_scraper, company_website, industry, imagelink, company_summary, company_description } = req.body;

  // it should be upsert
  // https://sequelize.org/docs/v6/other-topics/upgrade/

  await company.upsert({ company_name, job_scraper, company_website, industry, imagelink, company_summary, company_description })
    .then((newCompany) => {

      if (newCompany[1] === false) {
        throw Error();
      }
      // https://stackoverflow.com/questions/26888457/how-to-undo-soft-delete-in-sequelize-js
      //  if deletedAT is not null, should do restore
      if (newCompany[0].dataValues.deletedAt !== null) {
        // instance is put in the first index
        // https://www.folkstalk.com/2022/09/force-delete-and-restore-in-sequelize-with-code-examples.html
        // instance's restore method with where option: where doesn't seem to work
        newCompany[0].restore();
      }
      res.status(200).json({ "new comapny created": newCompany[0].dataValues.company_name })
    })
    .catch(error => {
      error.message = `[${error.name || 'Database'}] ${error.message}`
      // internal database error
      error.statusCode = 500;
      next(error);
    });
};

// soft-deletion
// https://sequelize.org/docs/v6/core-concepts/paranoid/
// /** @type {import("sequelize").Model} */
exports.deleteCompany = async (req, res, next) => {
  const id = req.params.id;

  await company.findOne({
    where: { uuid: id },
    // only non-deleted records will be returned.
    paranoid: true
  })
    .then(async (targetCompany) => {
      // force set to false to do soft-deletion
      if (targetCompany) {
        await targetCompany.destroy({ force: false })
          .then(deletedInstance => {
            res.status(200).json({ "company deleted": deletedInstance.company_name })
          });
      } else {
        const error = new Error("no matching record");
        error.name = 'Database';
        throw error;
      }
    })
    .catch(error => {
      error.message = `[${error.name || 'Database'}] ${error.message}`
      // internal database error
      error.statusCode = 500;
      next(error);
    });
};

// Give out the list of companies that offers the same type of benefit specified in param
// the response will include the benefit information as well
/** @type {import("express").RequestHandler} */
exports.getCompaniesWithSameBenefit = async (req, res, next) => {
  const benefitType = req.params.benefit_type;

  // https://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
  if (BENEFIT_TYPES.indexOf(benefitType) > -1) {

    /* Raw Query */
    // const queryResult = await sequelize.query(`SELECT company.*, benefit.benefit_type, benefit.benefit_details, benefit.link_to_benefit_details 
    //                       FROM company INNER JOIN benefit on company.company_name = benefit.company_name 
    //                       where benefit.benefit_type = '${benefitType}' and "company"."deletedAt" is null and "benefit"."deletedAt" is null
    //                        order by company.company_name asc`);
    //  res.status(200).json(queryResult);

    //  Inner join in sequelize
    await company.findAll({
      include: [
        {
          attributes: ['benefit_type', 'benefit_details', 'link_to_benefit_details'],
          model: benefit,
          paranoid: true,
          required: true,
          where: {
            benefit_type: benefitType
          }
        }],
      paranoid: true,
      order: [['company_name', 'ASC']]
    })
      .then(companyList => {
        // console.log(companyList)
        // benefit columns' position should be rearraged
        companyList.forEach((element, index) => {
          for (property in element.dataValues.benefits[0].dataValues) {
            // console.log(er)
            // console.log(element.benefits[0].dataValues[er])
            element.dataValues[property] = element.benefits[0].dataValues[property];
          }
          delete element.dataValues.benefits;
          if (index === 0)
            console.log(element)
          // element = ;

        });
        res.status(200).json(companyList);
      })
      .catch(error => {
        error.message = `[${error.name || 'Database'}] ${error.message}`
        // internal database error
        error.statusCode = 500;
        next(error);
      })
  } else {
    // 400 : an error caused by an invalid request.
    const error = new Error(`[getCompaniesWithSameBenefit] Error :  benefit type "${benefitType}" is not defined`);
    error.statusCode = 400;
    next(error);
  }
};

// router.get('/company/:companyName/benefit', async (req, res) => {
//   const company_name = req.params.companyName
//   try {
//     const queryResult = await company.findOne({
//       where: { company_name },
//       // I did freeze table but wht it takes plural in association name?
//       // find out how other people freezetable in each model to see if it works
//       include: 'benefits',
//     })

//     return res.json(queryResult)
//   } catch (err) {
//     console.log(err)
//     return res.status(500).json({ error: `Something went wrong: ${err}` })

//   }
// })

// // TODO : implement put, post
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



/*

 


router.get('/company/:companyName', async (req, res) => {
  try {
    const company_name = req.params.companyName
    const queryResult = await company.findOne({
      where: { company_name }
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





module.exports = router

*/