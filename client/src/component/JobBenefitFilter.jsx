import React from 'react'
import benefits from '../data/BenefitTypes.json'
import { BenefitOption } from './BenefitOption'

export const JobBenefitFilter = () => {

    return (
        <div className="job-benefit-options" >
            {benefits.map((benefit) => (
                <BenefitOption key={benefit.benefitType} benefits={benefit}/>
            ))}
        </div>
    )
}
