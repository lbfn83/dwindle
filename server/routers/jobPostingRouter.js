const express = require('express');
const router = express.Router();
const {jobposting, sequelize} = require('../models');
// const sequelize = require('sequelize')
const {toHttp} = require('../util/toHttp')
const {pullJobPostings} = require('../service/jobPostingFetcher')
const util = require('util')

const recordLimit = 250
// promisify

// Referenced project :: https://github.com/hidjou/classsed-orms-sequelize/blob/master/app.js

//  a) incoming get request with no query parameters 
//  use case : initial page before setting search criteria will provide certain number of recent job postings 

//  b) incoming get request with query parameters ( search criteria : {company, location}) 
//  use case : this will provide total job postings that fall under the search criteria 
//  example of request made from front end
//  => http://localhost:5000/database/jobposting?company=Pwc&country=canada

//  What I learned : default postgres DB query is case sensitive 
// "pwc" won't return data entries with "PwC"   
// router.get('/jobposting', async (req, res) => {

//       try {
//           let {company, country, pagenum = 1}= req.query
  
//           const whereStatement = {
//               // https://stackoverflow.com/questions/11704267/in-javascript-how-to-conditionally-add-a-member-to-an-object
//               // spread is being used because it is wrapped with {} bracket
//               ...(company !== undefined ) && {company_name: sequelize.where(sequelize.fn('UPPER', sequelize.col('company_name')), 'LIKE', company.toUpperCase() )},
//               ...(country !== undefined ) && {normalized_job_location : country.toUpperCase()},
              
//           }
  
          
          
//           return res.json(queryResult[0])
          
//       } catch (err) {
//           console.log(err)
//           return res.status(500).json({ error: `Something went wrong: ${err}` })
//       }
//   })
  


// This end point will be used for all the jobposting related search done in the front-end
router.post('/jobpostings', async (req, res) => {

    try {
        // defualt value applies only when there is no key specified in the request
        let {company="", location="", pagenum = 0, keyword ="", benefits = []}= req.body
        console.log(req.body)
        console.log(benefits)
        // old code

        // const whereStatement = {
        //     // https://stackoverflow.com/questions/11704267/in-javascript-how-to-conditionally-add-a-member-to-an-object
        //     // spread is being used because it is wrapped with {} bracket
        //     ...(company !== undefined ) && {company_name: sequelize.where(sequelize.fn('UPPER', sequelize.col('company_name')), 'LIKE', company.toUpperCase() )},
        //     ...(country !== undefined ) && {normalized_job_location : country.toUpperCase()},
            
        // };
      
        let queryResult = undefined;
        if( keyword === '')
        {
            // old code
            /*
            const { count, rows } = await jobposting.findAndCountAll({
              where : whereStatement,
              order : [['posted_date', 'DESC']],
              limit : pagenum*limit
              // where: {
              //     company_name: sequelize.where(sequelize.fn('UPPER', sequelize.col('company_name')), 'LIKE', company ),
              //     // normalized_job_location is an ENUM column defined with predefined words {USA, CANADA} consisting of UPPERCASE letters only
              //     normalized_job_location : country
              // }
            })
            */

            //  https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-order-by/
            // order by uuid is essential as ... without it every query's result will be sorted in a different way and pagination won't work as intended
            queryResult= await sequelize.query(`SELECT jobposting.*, benefit_agg.benefit_type_array, (benefit_agg.benefit_type_array @> '{student_loan_repayment}') as student_loan_repayment, 
            (benefit_agg.benefit_type_array @> '{tuition_reimbursement}') as tuition_reimbursement,  (benefit_agg.benefit_type_array @> '{tuition_assistance}') as tuition_assistance,
            (benefit_agg.benefit_type_array @> '{full_tuition_coverage}') as full_tuition_coverage
            FROM jobposting left join 
              (  SELECT benefit.company_name as company_name , array_agg(benefit.benefit_type) as benefit_type_array
                FROM benefit group by benefit.company_name) 
              as benefit_agg on benefit_agg.company_name = jobposting.company_name 
              order by posted_date DESC, jobposting.company_name ASC, jobposting.uuid ASC `) 
              // limit ${recordLimit} offset ${recordLimit*pagenum}
        
        }else
        {
            // 여기서는 search() 함수를 사용해줘야 겠지..
        }
        console.log(`[jobpostings router:post] search keyword : ${keyword}/ number of data in total:  ${queryResult[0].length}`)
        
        // Execute filtering of data according to the parameters in the request body
        let filteredResult = queryResult[0];
      
        // TODO : 
        // why did I add normalized_company_name? company_name is the foreign key
        // it is just passed over from RapidAPI 
        
        if(company !== "")
        {
          
          filteredResult = filteredResult.filter((jobposting) => {
              // console.log(jobposting.company_name);
              if(jobposting.company_name.toUpperCase() === company.toUpperCase())
                  return jobposting;
          });
          console.log(`[jobpostings router:post] filtering with company name : ${company}/ number of data after filtering:  ${filteredResult.length}`)
         
        }
        if(location !== "")
        {
          filteredResult = filteredResult.filter((location) => {
            // console.log(jobposting.company_name);
            // for now, it is utilizing normalized_location
            // gotta see... the libarary
            if(jobposting.normalized_location === location)
                return jobposting;
              });
          console.log(`[jobpostings router:post] filtering with location : ${location}/ number of data after filtering:  ${filteredResult.length}`)
        }
        if(benefits.length > 0)
        { 
          // https://www.w3schools.com/jsref/jsref_foreach.asp 
          // multiplay each element
          benefits.forEach((benefit) => {
              console.log(benefit)
              filteredResult = filteredResult.filter((elem) => (elem[benefit] === true));
          })
          console.log(`[jobpostings router:post] filtering with benefit types : ${JSON.stringify(benefits)}/ number of data after filtering:  ${filteredResult.length}`)
      
        }
     



        // As a last step, Pagination is applied
        const paginationResult = filteredResult.filter((elem, idx) => (idx >= recordLimit*pagenum) && (idx < recordLimit*(pagenum+1)))
        console.log(`[jobpostings router:post] pagination record # : ${paginationResult.length} / lower limit : ${recordLimit*pagenum} / upper limit : ${recordLimit*(pagenum+1)-1}`)
        // console.log(paginationResult)
        

        // jsonfy is really required?
        return res.json(paginationResult)
        
    }catch (err) {
        console.log(err)
        return res.status(500).json({ error: `Something went wrong: ${err}` })
    }
})


// post might be needed for future when any company wants to register a job posting
// to be able to register jobposting.. 
// company should be registered first
// Do I need to let it automatically create new company 
// from this process??
router.post('/jobposting', async (req, res) => {
    // uuid, updatedat, deletedat shouldn't be mendatory columns
    // "linkedin_job_url_cleaned": primary key 
    // "company_name": 
    // "normalized_company_name": should have same name as company name
    // "job_title": "Seasonal Warehouse Team Member",
    // "job_location": "Hamilton, Ontario, Canada",
    // "normalized_job_location": This one should be mendatory part?
    // "posted_date": Get the timestamp when this entry is inserted
    // "full_text": "",
    const { name, email, role } = req.body
  
    try {
      const user = await jobposting.create({ name, email, role })
  
      return res.json(user)
    } catch (err) {
      console.log(err)
      return res.status(500).json(err)
    }
  })

  /***WIP : Give out the whole list of jobpostings that fall under the benefit types *** */
  /* Should utilze Join as benefit information is availabe in benefit table */
  /* Should also come before :uuid  */
  router.get('/jobposting/benefit', async (req, res) => {
  
    try {
      let {benefit_type} = req.query;
      benefit.map
      benefit_type = benefit_type ? encodeURIComponent(benefit_type) : '';
      console.log(benefit_type);
      // let { search_terms = '',location = '', page = '1',fetch_full_text = 'yes' } = req.query;
      
      // search_terms = search_terms ? encodeURIComponent(search_terms) : '';
      // location = location ? encodeURIComponent(location) : '';
      return res.json(req.query)
    }catch (err) {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong' })
    }
  })
router.get('/jobposting/:uuid', async (req, res) => {
    const uuid = req.params.uuid
    try {
      const user = await jobposting.findOne({
        where: { uuid },
        include: 'company',
      })

      return res.json(user)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong' })
    }
  })
  
router.delete('/jobposting/:uuid', async (req, res) => {
    const uuid = req.params.uuid
    try {
      const user = await jobposting.findOne({ where: { uuid } })
  
      await user.destroy()
  
      return res.json({ message: 'User deleted!' })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong' })
    }
  })
  //https://stackoverflow.com/questions/107390/whats-the-difference-between-a-post-and-a-put-http-request
  // https://www.guru99.com/put-vs-post.html 
router.put('/jobposting/:uuid', async (req, res) => {
    const uuid = req.params.uuid
    const { name, email, role } = req.body
    try {
      const user = await jobposting.findOne({ where: { uuid } })
  
      user.name = name
      user.email = email
      user.role = role
  
      await user.save()
  
      return res.json(user)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong' })
    }
  })

  

    
/****************************** */


router.get('/fetchJOBpostingData', async(req, res)=> {
              await toHttp(pullJobPostings, req, res)})
  

module.exports = router