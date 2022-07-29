import React from 'react'
import benefits from '../data/BenefitTypes.json'
import JobPostings from './JobPostings';
import { BenefitButton } from './benefitButton';


export const JobBenefitFilter = ({jobList, callbackFunction}) => {

    // if the index in the mapped array is clicked match it with the benefittypes json file index number - if they match extract benefitType data and push into a new array
    const arrayHolder = []

    const extractData = (index) => {
        // console.log(benefits[index].benefitType)
        const benefit = benefits[index].benefitType

        // this will check if the benefit type is already in the array, if it is it will remove the benefit other wise it will add it to the array
        if(arrayHolder.includes(benefit)){
            const indexObject = arrayHolder.findIndex(beneType => {
                return beneType === benefit;
            })

            arrayHolder.splice(indexObject, 1)
        } else {
            arrayHolder.push(benefit)
        }
        callbackFunction(arrayHolder)

    }
    
    return (
        <div>

            <div className="job-benefit-options" >
                {benefits.map((benefit, index) => (
                    <div key={index} onClick={() => extractData(index)}>
                        <BenefitButton benefit={benefit} />
                    </div>
                ))}
            </div>

            { (jobList.length > 0) ? <JobPostings jobList={jobList}/> : <div> No result </div> }
            {/* {console.log(jobList)} */}

            {/* <JobPostings jobList={jobList.jobpostings}/> */}

        </div>
    )
}
