import React, { useState } from 'react'

export const BenefitOption = ( { benefits } ) => {
    const { title } = benefits
    const [isActive, setActive] = useState(false);

    
    const handleToggle = () => {
        setActive(!isActive)
    }

    return (
    <div className={isActive ? "benefit-option-focus" : "benefit-option" } onClick={handleToggle}>
        {title}
    </div>
  )
}
