import React, {useState} from 'react'

export const BenefitButton = ({benefit}) => {

  const [state, changeState] = useState(false);
  // const [ benefitType, setBenefitType ] = useState([])

  const handleToggle = () => {
      
      changeState(!state)
      

  }


  const toggleActiveStyles = (state) => {
      // setBenefitType(benefits[index].benefitType)

      if(state === true){
          return "benefit-option-focus";
      } else {
          return "benefit-option"
      }
  }

 

  return (

    <div
        className={toggleActiveStyles(state)}
        onClick={() => {
            handleToggle()
        }}
    >
        <input type="checkbox" id={benefit.title} checked={state}/>
        {benefit.title}
    </div>
    

  )
}
