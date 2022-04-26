import React from 'react'

export default function JobPostings({jobList}) {
  try{
    //   if use props as an argument, props.pokemon is the right way to refer to
      console.log("jobitems from JobPostings function: ", jobList)
      let temp = jobList.map(p => (<div> {p} </div>) )
      console.log("mapped array in JobItems", temp) 
      // const temp = Object.keys(joblist)
        // console.log("keys" , temp)

        // .joblist.map( p=>                     // you need to have a key for single element of array?
        //         <div key ={p}>{p}</div> )}
            return (
            <div>
              { jobList.map( (p,index) =>(
                 
                      [<div key = {2*index-1}>{index} | {p.job_title} | {p.company_name} </div>, 
                      <div key = {2*index}>{index} | {p.job_location} | {p.posted_date} </div>]
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
