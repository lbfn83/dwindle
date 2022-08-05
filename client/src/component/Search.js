import React, {useState, useEffect} from "react";
// import JobPostings from "./JobPostings";
import axios from 'axios'
import { BACKEND_SVR_URL } from "../util/constants";
import { JobBenefitFilter } from './JobBenefitFilter';
import Pagination from "./Pagination";

function Search({keyword : keywordField,
                loc : locationField,
                btnClicked : btnCounter,
                parentCallBack})
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
//    let pageNum = 0


    const [loading, setLoading] = useState(false)
    const [arryJobPosting, setArryJobPosting] = useState([])
    const [tuitionBenefit, setTuitionBenefit ] = useState([])
    const [pageNum, setPageNum] = useState(0)
    const [refreshData, setRefreshData ] = useState(false)
//    console.log("evtTriggered : ", btnCounter)
   
    const callbackBenefitFilter = (Benefit) => {
        
        // this will check if the benefit type is already in the array, if it is it will remove the benefit other wise it will add it to the array
        if(tuitionBenefit.includes(Benefit)){
            setTuitionBenefit(index => index.filter(benefit => {
                return benefit !== Benefit 
            }))
        } else {
            setTuitionBenefit(oldArray => [...oldArray, Benefit])
        }  
    }

    const next = () => {
        // pageNum++;
        setPageNum(num => num + 1)
        console.log(pageNum)
        setRefreshData(!refreshData)
    }

    const previous = () => {
        // pageNum--;
        setPageNum(num => num - 1)
        if(pageNum < 0){
            setPageNum(0)
        }
        
        console.log(pageNum)
        setRefreshData(!refreshData)
    }

    const getData = () => {
        const apiReqString = `${BACKEND_SVR_URL}/database/jobpostings` 

        // const apiReqString = `${BACKEND_SVR_URL}/database/jobposting?company=${search_terms}&country=${location}&page=${pageNum}`
        //    console.log(apiReqString)
        const postOptions = { 
            company: `${search_terms}`,
            location: `${location}`,
            pagenum: pageNum ,
            keyword: "",
            benefits: tuitionBenefit              
        };
       setLoading(true)
        axios.post(apiReqString, postOptions).then(res => {
                parentCallBack(res.data.companylist)
                setLoading(false)
                setArryJobPosting(res.data.jobpostings)
                // console.log("arryJobPosting content : ", res.data.jobpostings.length, typeof res.data.jobpostings)
        })
    }

   useEffect( () => {
    // build up query Parameter string
        setArryJobPosting([])


        getData()
    }, [refreshData, btnCounter])
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
        <div>
            {/* <div>{arryJobPosting&&arryJobPosting.map(jobItem => <div> {JSON.stringify(jobItem)} </div>)}</div> */}
            <JobBenefitFilter jobList={arryJobPosting} callbackFunction={callbackBenefitFilter}/>
            {/* { (arryJobPosting.length > 0)? <JobPostings jobList={arryJobPosting}/> : <div> No result </div> } */}
            <Pagination next={next} previous={previous} />
        </div>
    );   


}
export default Search;

