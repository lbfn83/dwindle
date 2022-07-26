import React, { useState } from 'react'
import benefits from '../data/BenefitTypes.json'

export const JobBenefitFilter = () => {

    const [state, changeState] = useState({
        activeObject: null
    });

    
    const handleToggle = (index) => {
        changeState({...state, activeObject: benefits[index]})
    }

    const toggleActiveStyles = (index) => {
        if(benefits[index] === state.activeObject){
            return "benefit-option-focus";
        } else {
            return "benefit-option"
        }
    }
    
    return (
        <div className="job-benefit-options" >
            {benefits.map((benefit, index) => (
                <div
                    key={index} 
                    className={toggleActiveStyles(index)}
                    onClick={() => {
                        handleToggle(index)
                    }}
                >
                    {benefit.title}
                </div>
            ))}
        </div>
    )
}
