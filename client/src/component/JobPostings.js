import React from 'react'


export default function JobPostings({jobList}) {
  try{
    //   if use props as an argument, props.pokemon is the right way to refer to
      // console.log("jobitems from JobPostings function: ", jobList)
      const redirectLinkPrefix = "https://dwindlestudentdebt.com/company-";
      const JLwithLink = jobList.map(p => {
        // https://stackoverflow.com/questions/9705194/replace-special-characters-in-a-string-with-underscore
        // p.redirectLink = redirectLinkPrefix+String(p.company_name).toLowerCase().replace(/\s/g,'');
        p.redirectLink = redirectLinkPrefix+String(p.company_name).toLowerCase().replace(/[^a-zA-Z0-9]/g,'');
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
                            <div className='company-title'>
                              <div className="logo-container">
                                  <a  href={p.redirectLink}><img src = {p.imagelink}></img></a>
                                </div>
                              <div className='title'>{p.company_name}</div>
                            </div>
                            
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
