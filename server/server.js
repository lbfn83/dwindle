// This is not for express server
// import { RAPID_API_KEY } from './util/constants';


const path = require('path');
const axios = require('axios');
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const buildPath = path.join(__dirname, '..', 'build');

require('dotenv').config()
// console.log(process.env)

app.use(express.static(buildPath));
app.use(cors());


// '{"search_terms":"target","location":"","page":"1","fetch_full_text":"yes"}'
app.get('/jobs', async (req, res) => {
    // console.log(req)
  try {
      let { search_terms = '',location = '', page = '1',fetch_full_text = 'yes' } = req.query;
   
    search_terms = search_terms ? encodeURIComponent(search_terms) : '';
    location = location ? encodeURIComponent(location) : '';
    

    // full_time = full_time === 'true' ? '&full_time=true' : '';

    //   TODO: page should be customized to iterate incrementally until meet the end of total pages.
    /*
    if (page) {
      page = parseInt(page);
      page = isNaN(page) ? '' : `&page=${page}`;
    }
    */

    // TODO : something that should be used later when making multiple request altogether 
    // axios.all([
    // axios.get('https://api.github.com/users/mapbox'),
    // axios.get('https://api.github.com/users/phantomjs')
    // ])


    const query = {
        method: 'POST',
        url: 'https://linkedin-jobs-search.p.rapidapi.com/',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
          'X-RapidAPI-Key': `${process.env.API_KEY}`
        },  
        data: `{"search_terms":"${search_terms}","location":"${location}","page":"${page}","fetch_full_text": "${fetch_full_text}"}`
      };  

    const result = await axios.request(query)
    // From Linked in to our backend server, we got object as a response, not string
    // console.log(typeof result.data)
    res.send(result.data);

  } catch (error) {
    res.status(400).send('Error while getting list of jobs.Try again later.');
  }
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});