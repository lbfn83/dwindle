import React from 'react'
import benefits from '../data/BenefitTypes.json'
import JobPostings from './JobPostings';
import { BenefitButton } from './benefitButton';


export const JobBenefitFilter = ({jobList, callbackFunction}) => {

    const extractData = (index) => {
        const benefit = benefits[index].benefitType
        callbackFunction(benefit)
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


        </div>
    )
}
