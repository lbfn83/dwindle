const express = require('express');
const router = express.Router();
const {jobposting, sequelize} = require('../models');
// const sequelize = require('sequelize')
const {toHttp} = require('../util/toHttp');
const {pullJobPostings} = require('../service/jobPostingFetcher');
const {logger} = require('../config/logger');
const pgPool = require('../config/pgLibDBconfig');

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
        let {company="", location="", pagenum = 0, keyword ="", benefits = []}= req.body;

        // To prevent the unexpected behavior with string data in pagenum variable
        pagenum = parseInt(pagenum);
        // old code
        
        // console.log(req.body)
        // console.log(benefits)
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
            // soft-deleted entries are ignored
            // Sequelize ORM output DATEONLY type as a string. 
            // Very unreliable. should get codes migrated into pg lib. 
            queryResult= await pgPool.query(`SELECT jobposting.*,  benefit_agg.company_website, benefit_agg.imagelink , benefit_agg.benefit_type_array, (benefit_agg.benefit_type_array @> '{student_loan_repayment}') as student_loan_repayment, 
            (benefit_agg.benefit_type_array @> '{tuition_reimbursement}') as tuition_reimbursement,  (benefit_agg.benefit_type_array @> '{tuition_assistance}') as tuition_assistance,
              (benefit_agg.benefit_type_array @> '{full_tuition_coverage}') as full_tuition_coverage FROM jobposting left join 
        
            (SELECT benefit.company_name ,array_agg(benefit.benefit_type) as benefit_type_array, (array_agg(company.company_website))[1] as company_website, (array_agg(company.imagelink))[1] as imagelink
        
                FROM benefit left join 
        
                   (  SELECT company_name, company_website, imagelink FROM company  ) 
        
                   as company on company.company_name = benefit.company_name where "deletedAt" is null group by benefit.company_name 
        
            ) as benefit_agg on benefit_agg.company_name = jobposting.company_name where "deletedAt" is null 
        
            order by posted_date DESC, jobposting.company_name ASC, jobposting.uuid ASC;`); 
              // limit ${recordLimit} offset ${recordLimit*pagenum}
        
        }else
        {
          queryResult = await jobposting.searchJobPosting(keyword, logger);
        }


        /* queryResult[1] structure example
        {
        "command":"SELECT",
        "rowCount":3,
        "oid":null,
        "rows":
          [
            {"uuid":"58192523-ef01-4bab-932e-f95ccbc6ff6d","linkedin_job_url_cleaned":"https://www.linkedin.com/jobs/view/manager-product-product-lifecycle-data-strategy-seattle-wa-at-starbucks-3146468508","company_name":"Starbucks","normalized_company_name":"Starbucks","job_title":"Manager, Product; Product Lifecycle & Data Strategy (Seattle, WA)","job_location":"Seattle, WA","normalized_job_location":"USA","posted_date":"2022-06-28","full_text":"","createdAt":"2022-07-05T06:53:19.420Z","updatedAt":"2022-07-05T06:53:19.420Z","deletedAt":null,"jobpostingToken":"'data':9 'lifecycl':8 'manag':5 'product':6,7 'seattl':3,11 'starbuck':1,2 'strategi':10 'wa':4,12"},
            {"uuid":"bf083df0-e382-44c6-9572-6ae346f3f1ad","linkedin_job_url_cleaned":"https://www.linkedin.com/jobs/view/product-manager-at-abbott-3097029703","company_name":"Abbott","normalized_company_name":"Abbott ","job_title":"Product Manager","job_location":"Santa Clara, CA","normalized_job_location":"USA","posted_date":"2022-06-13","full_text":"","createdAt":"2022-07-06T04:03:07.840Z","updatedAt":"2022-07-06T04:03:07.840Z","deletedAt":null,"jobpostingToken":"'abbott':1,2 'ca':5 'clara':4 'manag':7 'product':6 'santa':3"},
            {"uuid":"4c50fd7d-0f7f-4cbe-9afd-ce80715ffa78","linkedin_job_url_cleaned":"https://www.linkedin.com/jobs/view/product-marketing-manager-amazon-music-at-amazon-3077978919","company_name":"Amazon","normalized_company_name":"Amazon","job_title":"Product Marketing Manager, Amazon Music","job_location":"San Francisco, CA","normalized_job_location":"USA","posted_date":"2022-07-02","full_text":"","createdAt":"2022-07-05T04:04:44.455Z","updatedAt":"2022-07-05T04:04:44.455Z","deletedAt":"2022-07-06T05:07:36.675Z","jobpostingToken":"'amazon':1,2,9 'ca':5 'francisco':4 'manag':8 'market':7 'music':10 'product':6 'san':3"}
          ],
          "fields":[
            {"name":"uuid","tableID":16803,"columnID":1,"dataTypeID":2950,"dataTypeSize":16,"dataTypeModifier":-1,"format":"text"},
            {"name":"linkedin_job_url_cleaned","tableID":16803,"columnID":2,"dataTypeID":25,"dataTypeSize":-1,"dataTypeModifier":-1,"format":"text"},
            {"name":"company_name","tableID":16803,"columnID":3,"dataTypeID":1043,"dataTypeSize":-1,"dataTypeModifier":259,"format":"text"},
            {"name":"normalized_company_name","tableID":16803,"columnID":4,"dataTypeID":1043,"dataTypeSize":-1,"dataTypeModifier":259,"format":"text"},
            {"name":"job_title","tableID":16803,"columnID":5,"dataTypeID":25,"dataTypeSize":-1,"dataTypeModifier":-1,"format":"text"},
            {"name":"job_location","tableID":16803,"columnID":6,"dataTypeID":1043,"dataTypeSize":-1,"dataTypeModifier":259,"format":"text"},
            {"name":"normalized_job_location","tableID":16803,"columnID":7,"dataTypeID":16799,"dataTypeSize":4,"dataTypeModifier":-1,"format":"text"},
            {"name":"posted_date","tableID":16803,"columnID":8,"dataTypeID":1043,"dataTypeSize":-1,"dataTypeModifier":259,"format":"text"},
            {"name":"full_text","tableID":16803,"columnID":9,"dataTypeID":25,"dataTypeSize":-1,"dataTypeModifier":-1,"format":"text"},
            {"name":"createdAt","tableID":16803,"columnID":10,"dataTypeID":1184,"dataTypeSize":8,"dataTypeModifier":-1,"format":"text"},
            {"name":"updatedAt","tableID":16803,"columnID":11,"dataTypeID":1184,"dataTypeSize":8,"dataTypeModifier":-1,"format":"text"},
            {"name":"deletedAt","tableID":16803,"columnID":12,"dataTypeID":1184,"dataTypeSize":8,"dataTypeModifier":-1,"format":"text"},
            {"name":"jobpostingToken","tableID":16803,"columnID":26,"dataTypeID":3614,"dataTypeSize":-1,"dataTypeModifier":-1,"format":"text"}
          ],
        "_parsers":[null,null,null,null,null,null,null,null,null,null,null,null,null],
        "_types":{"_types":{},"text":{},"binary":{}},"RowCtor":null,"rowAsArray":false}
        */
        logger.debug(`[jobpostings router:post] query result before filtering : ${JSON.stringify( queryResult.rows)}`);
        logger.debug(`[jobpostings router:post] search keyword : ${keyword}/ number of data in total:  ${queryResult.rows.length}`);
        // console.log(`[jobpostings router:post] search keyword : ${keyword}/ number of data in total:  ${JSON.stringify(queryResult[0].map(elem => elem.uuid))}`);
        
        // Execute filtering of data according to the parameters in the request body
        // Deep copy approach will turn Date type into string type again
        // and changing string with DATE() will apply locale so date might not be accurately displayed 
        let filteredResult = JSON.parse(JSON.stringify(queryResult.rows));
        // let filteredResult = queryResult.rows;
        // why did I add normalized_company_name in the table? company_name is the foreign key
        // it is just passed over from RapidAPI 
        
        // applying filters
        if(company !== "")
        {
          
          filteredResult = filteredResult.filter((jobposting) => {
              // console.log(jobposting.company_name);
              if(jobposting.company_name.toUpperCase() === company.toUpperCase())
                  return jobposting;
          });
          logger.debug(`[jobpostings router:post] filtering with company name : ${company}/ number of data after filtering:  ${filteredResult.length}`)
         
        }
        if(location !== "")
        {
          filteredResult = filteredResult.filter((jobposting) => {
            // console.log(jobposting.company_name);
            // utilize standardized address string
            if(jobposting.std_loc_str === location)
                return jobposting;
              });
          logger.debug(`[jobpostings router:post] filtering with location : ${location}/ number of data after filtering:  ${filteredResult.length}`)
        }
        if(benefits.length > 0)
        { 
          // https://www.w3schools.com/jsref/jsref_foreach.asp 
          benefits.forEach((benefit) => {
              // console.log(benefit)
              filteredResult = filteredResult.filter((jobposting) => (jobposting[benefit] === true));
          })
          logger.debug(`[jobpostings router:post] filtering with benefit types : ${JSON.stringify(benefits)}/ number of data after filtering:  ${filteredResult.length}`)
      
        }
     

        /* 'TODO:filter list generation */
        // https://www.codegrepper.com/code-examples/javascript/how+to+get+unique+values+in+array+of+objects+in+react+js
        const companyFilteringList = [...new Set(filteredResult.map(jobposting => jobposting.company_name))].sort();
        logger.debug(`[jobpostings router:post] distinct(company) :  ${companyFilteringList}`);
        
        const locationFilteringList = [...new Set(filteredResult.map(jobposting => jobposting.std_loc_str))].sort();
        logger.debug(`[jobpostings router:post] distinct(location) :  ${locationFilteringList}`);
       

        /************ */


        // As a second last step, Pagination is applied
        let paginationResult = filteredResult.filter((elem, idx) => (idx >= recordLimit*pagenum) && (idx < recordLimit*(pagenum+1)))
        logger.debug(`[jobpostings router:post] pagination record # : ${paginationResult.length} / lower limit : ${recordLimit*pagenum} / upper limit : ${recordLimit*(pagenum+1)-1}`)
        // logger.debug(`[jobpostings router:post] paginationResult :  ${JSON.stringify(paginationResult)}`);
        paginationResult.forEach((element) => {
            // Heroku Database is converting string into date with GMT-4 locale 00:00:00
            // Covert it to UTC again. 
            const ESTTime = Date.parse(element.posted_date);
            const timeOffset = new Date(ESTTime).getTimezoneOffset();
            element.posted_date = new Intl.DateTimeFormat('en-US', {timeZone : 'UTC'}).format(new Date(ESTTime + timeOffset*60000));
            // element.posted_date = new Intl.DateTimeFormat('en-US').format(element.posted_date);
        });
        // As a final step, post
        
        /*TODO : generate whole response array*/
        const response = {
          jobpostings : paginationResult,
          companylist : companyFilteringList,
          locationlist : locationFilteringList
        };
        // console.log(response)

        return res.json(response)
        
    }catch (err) {
        logger.error(`[jobpostings router:post] Error : ${err}`);
        return res.status(500).json({ error: `Something went wrong: ${err}` });
    }
})

/** Refinement required from the below */

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
/**
 * TODO : it should go through the middleware
 */
router.get('/fetchJOBpostingData', async(req, res)=> {
              await toHttp(pullJobPostings, req, res)})
  

module.exports = router;