
import React, { useEffect, useState } from 'react'
import Search from './Search';
import axios from 'axios'
import { BACKEND_SVR_URL } from "../util/constants";
// import AsyncSelect from 'react-select/async' 
// import Select from 'react-select'

// https://medium.com/geekculture/create-a-simple-search-component-in-react-js-using-react-hooks-710c1dfe8b58
export const JobPostSearch = () => {
  
  const [keywordField, setkeywordField] = useState("");
  const [locationField, setlocationField] = useState("")
  const [clickCounter, setClickCounter] = useState(0)
  
  const [ loading, setLoading ] = useState(false)
  const [arryCompany, setArryCompany] = useState([])

  const handleClick = (event) => {
    event.preventDefault()
    
    setClickCounter( clickCounter+1 )
  }

  // const getJobData = async() => {
  //   const response = await fetch(`${BACKEND_SVR_URL}/database/companies`, {
  //     method: 'GET', // *GET, POST, PUT, DELETE, etc.
  //     mode: 'cors',
  // })
  // const data =  await response.json()
  // setArryCompany(data)
  // console.log(data[0])
  // }

  useEffect( () => {
       
    const apiReqString = `${BACKEND_SVR_URL}/database/companies`
 //    console.log(apiReqString)
    setLoading(true)
    axios.get(apiReqString).then(res => {
          setLoading(false)
          console.log("company list response : ",res.data)
          setArryCompany(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps

 }, [])


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
  

  const handleChange = (event) => {
    // console.log(event)
    // console.log(event.target.placeholder)
    switch(event.target.id){
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

  // const loadOptions = async(inputText, callback) => {
  //   const response = ['abc', 'dec', 'eer', 'wqe'];
  //   callback( response.map(i => ({label : i, value : i})))

  // }

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
            <select id='keywords'  onChange={handleChange}>
                <option value="">--Please choose an option--</option>
                {
                  arryCompany.map( (p, index) =>
                    <option key={index} value={p.companyname} >{p.companyname}</option>
                  )
                }
  
            </select>
           
            {/* <Select
              
                defaultValue={colourOptions[0]}
                options={colourOptions}
                    
            /> */}
           
            <select id="location"  onChange={handleChange}>
                <option value="">--Please choose an option--</option>
                <option value="USA" >USA</option>
                <option value="CANADA">CANADA</option>
            </select>



            <button onClick={handleClick} >Find Jobs</button> 
            {/* disabled = {!(keywordField&&locationField)} */}
        </form>

        <form className = 'search-result'>
            <Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter}/>
            
            {/* {(clickCounter>0)?<Search keyword = {keywordField} loc = {locationField} btnClicked = {clickCounter}/>: null} */}
        </form>
    
    </div>
  )
}
