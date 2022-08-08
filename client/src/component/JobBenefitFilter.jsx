import React from 'react'
import JobPostings from './JobPostings';

export const JobBenefitFilter = ({jobList}) => {
    
    return (
        <div>

            { (jobList.length > 0) ? <JobPostings jobList={jobList}/> : <div> No result </div> }


        </div>
    )
}
