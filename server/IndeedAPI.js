// import axios from 'axios'
// import fs from 'fs'
// import { RAPID_API_KEY } from './util/constants'



const axios = require('axios')
const fs = require('fs')
const staticVariables = require('./util/constants')


// Get to the end of page function
//should I make this as generator funcitron?

// or kinda recursive way :this looks more like js style though
//  https://stackoverflow.com/questions/45179965/how-can-i-while-loop-an-axios-get-call-till-a-condition-is-met

function fetchJobPosting(options)
{
  // // I think it is better to write in a file stream
  // // https://stackoverflow.com/questions/33418777/write-a-line-into-a-txt-file-with-node-js
  // fs.appendFile('./QueryResult/CheckEndofPages.txt', JSON.stringify(res.data), err => {
  //   if (err)
  //     console.log('Error occurred' , err)
  // })


  // TODO: File stream.. Should think about when to open and when to close? 
  // Also for now, this file stream is used as alternative to DB in this prototype version
  // but at the end of day, file stream will be only used as event logger.

  console.log('fileDB? : ',fileDB)
  
  // https://nodejs.dev/learn/writing-files-with-nodejs
  var fileDB = fs.createWriteStream('./QueryResult/CheckEndofPages4.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })

  // https://axios-http.com/docs/api_intro
  axios.request(options).then( res => {
    // console.log("Fetched data : ", res);
    console.log(typeof(res))

    console.log("Header_DATA___ :")
    console.log(JSON.stringify(res.headers))
    
    
    // * Converting an object to a string
    // JSON.stringfy / js to server? and js to file?
    // https://stackoverflow.com/questions/5612787/converting-an-object-to-a-string
    // https://www.codegrepper.com/code-examples/javascript/js+dict+to+string

    // *Converting a string to an object
    // JSON.parse() / server to js? file to js?
    // https://www.w3schools.com/js/js_json_parse.asp
    // When receiving data from a web server, the data is always a string.
    
    console.log("Config_DATA___ :")
    console.log(JSON.parse(res.config.data))
    
    var delimiter = "\n-----------------------------------\n"
    
    fileDB.write(delimiter)
    
    //  How to take out my API request body from response? res.config.data
    fileDB.write(res.config.data)
    fileDB.write(delimiter)

    // res.data is array type
    // Since there is no 'total_page_count' in response, 
    // I should find the other way around to find the end of pages => "if size of array is 0 then stop the query!"
    // it is kind of waste of cpu power and money though .. +1 more query to every search word
    
    // JSON.stringify is not working
    //TypeError: Converting circular structure to JSON
    // https://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json
    // I think there are two 'headers' which are duplicate entries. circular reference
    
    fileDB.write("****Size of Arrays: " + res.data.length + "\n")
    
    let nextQueryOption = JSON.parse(res.config.data)      
    if( res.data.length > 0 || (nextQueryOption.page < 5))
    {
      fileDB.write(JSON.stringify(res.data))
      fileDB.write(delimiter)
      
      nextQueryOption.page = (parseInt(nextQueryOption.page)+1).toString()
      

      console.log("!!!!")
      console.log(nextQueryOption)


      options.data = JSON.stringify(nextQueryOption)
      // In every recursive call, fileDB should be reinitialized
      // Since in every level of call, fileDB's content won't be passed down
      // unless I put this as argument of function call
      fileDB.end()
      fetchJobPosting(options)

    }
    else{
      // Error: Request failed with status code 429
      //End the function if there is no content in body
      fileDB.end()
      return res
    }
  }).catch(function (error) {  
    console.error(error);
    return null
  });    
}  



var options = {
  method: 'POST',
  url: 'https://linkedin-jobs-search.p.rapidapi.com/',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
    // This key should be replaced with User before production. 
    // 4,000 request / month Hard Limit is 30 dollars per month
    // 25 / month 
    // currently this key is tied to my kamatra83@gmail.com
    'X-RapidAPI-Key': `${staticVariables.RAPID_API_KEY}`
  },  
  data: '{"search_terms":"amazon","location":"","page":"1","fetch_full_text":"yes"}'
};  

// TODO: should define trigger here that every 10 a.m (?) execute this script
// TODO: Read search keyword from Jesse's company list excel file.. and then execute query for each one
// TODO: there are multiple API query will be made, can I use multithread here?
// TODO: API_KEY handling... it seems like exposed.. there must be some way to process it in a secure way

const res = fetchJobPosting(options);


