import React, {useState, useEffect} from "react";
import JobPostings from "./JobPostings.js";
import axios from 'axios'
import { BACKEND_SVR_URL } from "../util/constants.js";

function Search()
{

    const pageNum = 1
    let search_terms = "target"
    let location = "23059"
    const fetch_full_text = 'yes'
    let apiReqString = `${BACKEND_SVR_URL}/jobs?search_terms='${search_terms}'&location='${location}'&page='${pageNum}'&fetch_full_text='${fetch_full_text}' `


    const [loading, setLoading] = useState(false)
    const [arryJobPosting, setArryJobPosting] = useState([])
    const [sendReq, setSendReq] = useState(true)

    useEffect( () => {
            setLoading(true)
            axios.get(apiReqString).then(res => {
                setLoading(false)
                console.log("Fetched data : ",res.data)
                setArryJobPosting(res.data)
                // console.log("arryJobPosting content : ", arryJobPosting, typeof arryJobPosting)
            })
    }, [sendReq])

    if (loading) return "Loading..."

    function toggleReq()
    {
        if(sendReq)
        {
            setSendReq(false)
        }else
        {
            setSendReq(true)
        }
    }
    //arryJobPosting is an array and when you sending this state to a child component as a prop
    // it is wrapped with curly braces and paired with key { argument_name_defined_in_return : array} 
    // so in JobPostings component definition, argument is stated as {jobList} to destructure this newly created object to array. 
    
    return (
        <>
         <button onClick={toggleReq}> "send request" </button> ,
         {/* <div>{arryJobPosting&&arryJobPosting.map(jobItem => <div> {JSON.stringify(jobItem)} </div>)}</div> */}
         <JobPostings jobList={arryJobPosting}/> 
        </>
      );
}
export default Search;

