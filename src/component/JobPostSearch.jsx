import { click } from '@testing-library/user-event/dist/click';
import React, { useState } from 'react'
import Search from './Search';

// https://medium.com/geekculture/create-a-simple-search-component-in-react-js-using-react-hooks-710c1dfe8b58
export const JobPostSearch = () => {
  
  const [keywordField, setkeywordField] = useState("");
  const [locationField, setlocationField] = useState("")
  const [clickCounter, setClickCounter] = useState(0)
  
  const handleClick = (event) => {
    event.preventDefault()
    
    setClickCounter( clickCounter+1 )
  }

  
  const handleChange = (event) => {
    // console.log(event)
    // console.log(event.target.placeholder)
    switch(event.target.placeholder){
      case "location" :
        setlocationField(event.target.value)
        break;
      
      case "keywords" :
        setkeywordField(event.target.value)
        break;
      
      default :
        console.log("undefined event : ", event)
    }
  }


  return (
    <div>
        
        <h1>
            Want to work for a company that helps you pay down your student debt?
        </h1>
        
        <p>We only list jobs that provide student loan repayment, tuition assistance, and tuition reimbursement benefits</p>

        <form className='form-component' >

            <input type="input" placeholder='keywords' onChange={handleChange}/>
            <input type="input" placeholder='location' onChange={handleChange}/>
            <button onClick={handleClick} disabled = {!(keywordField&&locationField)}>Find Jobs</button>
        </form>

        <form className = 'search-result'>
            {/* <Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter}/> */}
            {(clickCounter>0)?<Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter}/>: null}
        </form>
    
    </div>
  )
}
