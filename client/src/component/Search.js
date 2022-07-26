import React, {useState, useEffect} from "react";
import JobPostings from "./JobPostings";
import axios from 'axios'
import { BACKEND_SVR_URL } from "../util/constants";
import { JobBenefitFilter } from './JobBenefitFilter';

function Search({keyword : keywordField,
                loc : locationField,
                btnClicked : btnCounter})
{
    /*Debugging part*/ 
    /*
    console.log("***************")
    console.log(keywordField)
    console.log(locationField)
    console.log("***************")
    */
   const search_terms = keywordField
   const location = locationField 
   const pageNum = 1


   const [loading, setLoading] = useState(false)
   const [arryJobPosting, setArryJobPosting] = useState([])

//    console.log("evtTriggered : ", btnCounter)
   
   useEffect( () => {
    // build up query Parameter string
        let isPrevParamExist = false // identifier to see whether inserting "&" in the string or not
        setArryJobPosting([])
        let queryParams = "?"
        if(search_terms === "")
        {
            // queryParams += ""        
        }else{
            queryParams += `company=${search_terms}`
            isPrevParamExist = true 
        }
        if(location === "")
        {
            // queryParams += ""        
        }else{
            if(isPrevParamExist)
                queryParams += '&'
            queryParams += `country=${location}` 
            isPrevParamExist = true
        }

        if(isPrevParamExist)
            queryParams += '&'
        queryParams += `page=${pageNum}`

        const apiReqString = `${BACKEND_SVR_URL}/database/jobpostings` + queryParams

        // const apiReqString = `${BACKEND_SVR_URL}/database/jobposting?company=${search_terms}&country=${location}&page=${pageNum}`
    //    console.log(apiReqString)
       setLoading(true)
        axios.post(apiReqString).then(res => {
                setLoading(false)
                console.log("Fetched data : ",res.data)
                setArryJobPosting(res.data)
                // console.log("arryJobPosting content : ", arryJobPosting, typeof arryJobPosting)
        })
    }, [btnCounter])
// Flaw of Initial design
/*
    useEffect's second argument wasn't working so it was executed in every non relevant event like change input field 
    Firstly, JobPostSearch module kept rendering Search component no matter what since I didn't block rendering with a condition i.e.(clickCounter>0)
    same goes to JobPostings component rendering
    so when initial rendering starts, api query with blank props is triggered : http://localhost:5000/jobs?search_terms=''&location=''&page='1'&fetch_full_text='yes' 
    
    Used counter for the trigger of effect hook, but boolean( buttonClicked ) will work as well
 
*/   

    if (loading) {return (
        <div> Loading... </div>
    )} else

    //arryJobPosting is an array and when you sending this state to a child component as a prop
    // it is wrapped with curly braces and paired with key { argument_name_defined_in_return : array} 
    // so in JobPostings component definition, argument is stated as {jobList} to destructure this newly created object to array. 
    
    return (
        <>
            {/* <div>{arryJobPosting&&arryJobPosting.map(jobItem => <div> {JSON.stringify(jobItem)} </div>)}</div> */}
            <JobBenefitFilter />
            
            { (arryJobPosting.length > 0)?<JobPostings jobList={arryJobPosting}/>: <div> No result </div> }
        </>
    );   


}
export default Search;

