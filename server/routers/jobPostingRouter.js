const express = require('express');
const router = express.Router();
const {jobposting, company} = require('../models');
const sequelize = require('sequelize')
const {toHttp} = require('../util/helper')
const {jobPostingQueryOptionBuilder} = require('../controllers/jobPostingFetcher')
const util = require('util')

const limit = 250
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

// TODO : limit should be added, pagenum should be added
router.get('/jobposting', async (req, res) => {

    try {
        let {company, country, pagenum = 1}= req.query

        const whereStatement = {
            // https://stackoverflow.com/questions/11704267/in-javascript-how-to-conditionally-add-a-member-to-an-object
            // spread is being used because it is wrapped with {} bracket
            ...(company !== undefined ) && {company_name: sequelize.where(sequelize.fn('UPPER', sequelize.col('company_name')), 'LIKE', company.toUpperCase() )},
            ...(country !== undefined ) && {normalized_job_location : country.toUpperCase()},
            
        }

        // where: {
        //     company_name: sequelize.where(sequelize.fn('UPPER', sequelize.col('company_name')), 'LIKE', company ),
        //     // normalized_job_location is an ENUM column defined with predefined words {USA, CANADA} consisting of UPPERCASE letters only
        //     normalized_job_location : country
        // }

        const { count, rows } = await jobposting.findAndCountAll({
            where : whereStatement,
            order : [['posted_date', 'DESC']],
            limit : pagenum*limit
        })
        console.log("[jobposting router:get] number of data sent: " + count)
        // jsonfy is really required?
        return res.json(rows)
        
    } catch (err) {
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

router.get('/jobposting/:uuid', async (req, res) => {
    const uuid = req.params.uuid
    try {
      const user = await jobposting.findOne({
        where: { uuid },
        include: 'posts',
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


router.get('/fetchJOBpostingData', async(req, res)=> {
              await toHttp(jobPostingQueryOptionBuilder, req, res)})
  

module.exports = router