import React from 'react'
import { CompanyBenefitCard } from './CompanyBenefitCard'
import benefits from '../data/BenefitTypes.json'

export const CompanyBenefitList = () => {

    return (
        <div className='company-benefit-list'>
            {benefits.map((benefit, id) => (
                <CompanyBenefitCard key={id} benefits={benefit}/>
            ))}
            
        </div>
    )
}
