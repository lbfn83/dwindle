
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

            {/* <input type="input" placeholder='keywords' onChange={handleChange}/>
            <input type="input" placeholder='location' onChange={handleChange}/> */}
            <select name="pets" id="pet-select">
                <option value="">--Please choose an option--</option>
                <option value="dog" onChange={handleChange}>Customer Service Agent</option>
                <option value="cat" onChange={handleChange}>Customer Liaison Officer</option>
                <option value="hamster" onChange={handleChange}>Retail Associate</option>
                <option value="parrot" onChange={handleChange}>Front Desk Manager</option>
                <option value="spider" onChange={handleChange}>Server</option>
                <option value="goldfish" onChange={handleChange}>Busser</option>
            </select>

            <select name="pets" id="pet-select">
                <option value="">--Please choose an option--</option>
                <option value="dog" onChange={handleChange}>Toronto</option>
                <option value="cat"onChange={handleChange}>Virginia</option>
                <option value="hamster" onChange={handleChange}>Vancouver</option>
                <option value="parrot" onChange={handleChange}>Miami</option>
                <option value="spider" onChange={handleChange}>Atlanta</option>
                <option value="goldfish" onChange={handleChange}>Los Angeles</option>
            </select>



            <button onClick={handleClick} disabled = {!(keywordField&&locationField)}>Find Jobs</button>
        </form>

        <form className = 'search-result'>
            {/* <Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter}/> */}
            {(clickCounter>0)?<Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter}/>: null}
        </form>
    
    </div>
  )
}
