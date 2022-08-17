
import React from 'react'
// import axios from 'axios'
// import { BACKEND_SVR_URL } from "../util/constants";
// import { JobBenefitFilter } from './JobBenefitFilter';
// import AsyncSelect from 'react-select/async' 
// import Select from 'react-select'

// https://medium.com/geekculture/create-a-simple-search-component-in-react-js-using-react-hooks-710c1dfe8b58
export const JobPostSearch = ({ keywordSet, locationSet, companyArray, locations } ) => {

  // const colourOptions = [
  //   { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
  //   { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
  //   { value: 'purple', label: 'Purple', color: '#5243AA' },
  //   { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
  //   { value: 'orange', label: 'Orange', color: '#FF8B00' },
  //   { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  //   { value: 'green', label: 'Green', color: '#36B37E' },
  //   { value: 'forest', label: 'Forest', color: '#00875A' },
  //   { value: 'slate', label: 'Slate', color: '#253858' },
  //   { value: 'silver', label: 'Silver', color: '#666666' },
  // ];
  
  // const handleClick = (event) => {
  //   event.preventDefault()
    
  //   setClickCounter( clickCounter+1 )
  //   setPageNum(0)

  // }

  const handleChange = (event) => {
    // console.log(event)
    // console.log(event.target.placeholder)

    switch(event.target.id){
      case "location" :
        locationSet(event.target.value)
        // console.log(event.target.value)
        break;
      
      case "keywords" :
        keywordSet(event.target.value)
        break;
      
      default :
        console.log("undefined event : ", event)
    }
  }

  // const loadOptions = async(inputText, callback) => {
  //   const response = ['abc', 'dec', 'eer', 'wqe'];
  //   callback( response.map(i => ({label : i, value : i})))

  // }

  // console.log(companyArray)
  return (
    <div>
        
        <h1>
            Want to work for a company that helps you pay down your student debt?
        </h1>
        
        <p>We only list jobs that provide student loan repayment, tuition assistance, and tuition reimbursement benefits</p>

        <form className='form-component' >
{/* https://stackoverflow.com/questions/28868071/onchange-event-using-react-js-for-drop-down */}
 
            {/* <input type="input" placeholder='keywords' onChange={handleChange}/>
            <input type="input" placeholder='location' onChange={handleChange}/> */}
            <select id='keywords' onChange={handleChange}>
                <option value="" >--Company--</option>
                {
                  companyArray.map((company, index) =>
                    <option key={index} value={company} >{company}</option>
                  )
                }
            </select>
            

           
            <select id="location" onChange={handleChange} >
                <option value="">--Location--</option>
                {
                  locations.map((location, index) => 
                    <option key={index} value={location}>{location}</option>
                  )
                }
            </select>



            {/* <button onClick={handleClick} >Find Jobs</button>  */}
            {/* disabled = {!(keywordField&&locationField)} */}
        </form>

        {/* <div className = 'search-result'>
            <Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter} parentCallBack={callbackFunction} resetPageNum={pageNum}/>
            
            {(clickCounter>0)?<Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter}/>: null}
        </div> */}

        
    
    </div>
  )
}
