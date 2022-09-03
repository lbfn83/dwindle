import React from 'react'


export default function JobPostings({jobList}) {
  try{
    //   if use props as an argument, props.pokemon is the right way to refer to
      // console.log("jobitems from JobPostings function: ", jobList)
      const redirectLinkPrefix = "https://dwindlestudentdebt.com/company-";
      const JLwithLink = jobList.map(p => {
        p.redirectLink = redirectLinkPrefix+String(p.company_name).toLowerCase().replace(/\s/g,''); 
        return p; 
      })
      // console.log(JLwithLink)
      // console.log("mapped array in JobItems", temp) 
      // const temp = Object.keys(joblist)
        // console.log("keys" , temp)

        // .joblist.map( p=>                     // you need to have a key for single element of array?
        //         <div key ={p}>{p}</div> )}
      
            return (
            <div>
              { JLwithLink.map( (p,index) =>(
                 
                      [
                        <div key = {2*index-1} className="job-posting">
                          <div className='posting-text-container'>
                            {/* <h2>{p.company_name}</h2> */}
                            {/* onClick={navigate(p.company_name)}  */}
                              <a style={{display: 'inline', backgroundColor : '#FFFFFF', boxShadow : 'none'} } href={p.redirectLink} ><img src = {p.imagelink} width = "100" height = "100"></img></a> 
                              
                              <div style={{display: 'inline', verticalAlign :'top', marginLeft : '10px'}}>{p.company_name}</div>
                              
                            
                            <h1> {p.job_title} </h1> 
                            <div >{p.job_location} | {p.posted_date} </div>
                          </div>
                          <a href={p.linkedin_job_url_cleaned} target="_blanck">Apply</a>
                        </div>
                      ]
              ))
              }
            </div>
          )
    
    }
  catch(e)
  {
    console.log("error : ", e)
  }
}
