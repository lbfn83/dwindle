import React, {useState, useEffect} from "react";
// import JobPostings from "./JobPostings";
import axios from 'axios'
import { BACKEND_SVR_URL } from "../util/constants";
import { JobBenefitFilter } from './JobBenefitFilter';
import Pagination from "./Pagination";
import BenefitButtonGroup from './BenefitButtonGroup';
import { JobPostSearch } from "./JobPostSearch";

function Search()
{
    /*Debugging part*/ 
    /*
    console.log("***************")
    console.log(keywordField)
    console.log(locationField)
    console.log("***************")
    */
//    let pageNum = 0

    const [keywordField, setkeywordField] = useState("");
    const [locationField, setlocationField] = useState([])
    const [companyField, setCompanyField ] = useState("")
    const [ arryCompany, setArryCompany ] = useState([])
    const [ arryLocation, setArryLocation ] = useState([])
    // const [clickCounter, setClickCounter] = useState(0)

    const [loading, setLoading] = useState(false)
    const [arryJobPosting, setArryJobPosting] = useState([])
    const [tuitionBenefit, setTuitionBenefit ] = useState([])
    const [pageNum, setPageNum] = useState(0)
    const [refreshData, setRefreshData ] = useState(false)
//    console.log("evtTriggered : ", btnCounter)
    
    // const companyCopy = [...arryCompany]
    // console.log(companyCopy)

    const callbackBenefitFilter = (Benefit) => {
        
        // this will check if the benefit type is already in the array, if it is it will remove the benefit other wise it will add it to the array
        if(tuitionBenefit.includes(Benefit)){
            setTuitionBenefit(index => index.filter(benefit => {
                return benefit !== Benefit 
            }))
        } else {
            setTuitionBenefit(oldArray => [...oldArray, Benefit])
        }  

        setRefreshData(!refreshData)
        
        
    }
    
    console.log(tuitionBenefit)
    const next = () => {
        // pageNum++;
        //first check if the next page 
        setPageNum(num => num + 1)
    
        setRefreshData(!refreshData)
    }

    const previous = () => {
        // pageNum--;
        setPageNum(num => num - 1)
        if(pageNum < 0){
            setPageNum(0)
        }
        
        setRefreshData(!refreshData)
    }

    const locationSet = (location) => {
        if(location === 'clear filter'){
            setlocationField('')
        } else {
            setlocationField(location)
        }
        setRefreshData(!refreshData)
        
    }

    const companySet = (company) => {
        if(company === 'clear filter'){
            setCompanyField('')
        } else {
            setCompanyField(company)
        }
        
        setRefreshData(!refreshData)
        
    }

    const keywordSet = (wordKey) => {
        setkeywordField(wordKey)
        setRefreshData(!refreshData)
        
    }
    
    
   useEffect( () => {
    // build up query Parameter string
        const getData = () => {
            const apiReqString = `${BACKEND_SVR_URL}/database/jobpostings` 

            // const apiReqString = `${BACKEND_SVR_URL}/database/jobposting?company=${search_terms}&country=${location}&page=${pageNum}`
            //    console.log(apiReqString)
            const postOptions = { 
                company: `${companyField}`,
                location: `${locationField}`,
                pagenum: pageNum ,
                keyword: `${keywordField}`,
                benefits: tuitionBenefit              
            };
        setLoading(true)
            axios.post(apiReqString, postOptions).then(res => {
                    
                    setArryCompany(res.data.companylist)
                    setLoading(false)
                    setArryLocation(res.data.locationlist)
                    setArryJobPosting(res.data.jobpostings)
                    
                    console.log("arryJobPosting content : ", res.data.jobpostings.length, typeof res.data.jobpostings)
            })

        }

        setArryJobPosting([])
        setArryLocation([])
        if(refreshData === true){
            setRefreshData(!refreshData)
        }
        getData()
    }, [refreshData])
    
// Flaw of Initial design
/*
    useEffect's second argument wasn't working so it was executed in every non relevant event like change input field 
    Firstly, JobPostSearch module kept rendering Search component no matter what since I didn't block rendering with a condition i.e.(clickCounter>0)
    same goes to JobPostings component rendering
    so when initial rendering starts, api query with blank props is triggered : http://localhost:5000/jobs?search_terms=''&location=''&page='1'&fetch_full_text='yes' 
    
    Used counter for the trigger of effect hook, but boolean( buttonClicked ) will work as well
 
*/   

    

    if (loading) {return (

        <div>

            <JobPostSearch keywordSet={keywordSet} locationSet={locationSet} companySet={companySet} companyArray={arryCompany} locations={arryLocation}/>
            
            <BenefitButtonGroup callbackFunction={callbackBenefitFilter} />

            <div> Loading... </div>  

        </div>
        
        
    )} else

    //arryJobPosting is an array and when you sending this state to a child component as a prop
    // it is wrapped with curly braces and paired with key { argument_name_defined_in_return : array} 
    // so in JobPostings component definition, argument is stated as {jobList} to destructure this newly created object to array. 
    
    return (
        <div>

            <JobPostSearch keywordSet={keywordSet} locationSet={locationSet} companySet={companySet} companyArray={arryCompany} locations={arryLocation}/>

            <BenefitButtonGroup callbackFunction={callbackBenefitFilter} />

            {/* <div>{arryJobPosting&&arryJobPosting.map(jobItem => <div> {JSON.stringify(jobItem)} </div>)}</div> */}
            <JobBenefitFilter jobList={arryJobPosting} />
            {/* { (arryJobPosting.length > 0)? <JobPostings jobList={arryJobPosting}/> : <div> No result </div> } */}
            <Pagination next={next} previous={previous} pageNum={pageNum} arryJobPosting={arryJobPosting}/>
        </div>
    );   


}
export default Search;

