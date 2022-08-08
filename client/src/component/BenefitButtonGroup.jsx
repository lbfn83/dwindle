import React from 'react'
import benefits from '../data/BenefitTypes.json'
import { BenefitButton } from './benefitButton';

const BenefitButtonGroup = ({callbackFunction}) => {

    const extractData = (index) => {
        const benefit = benefits[index].benefitType
        callbackFunction(benefit)
    }

  return (
    <div className="job-benefit-options" >
        {benefits.map((benefit, index) => (
            <div key={index} onClick={() => extractData(index)}>
                <BenefitButton benefit={benefit} />
            </div>
        ))}
    </div>
    
  )
}

export default BenefitButtonGroup