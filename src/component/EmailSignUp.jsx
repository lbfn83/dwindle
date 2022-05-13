import React, { useEffect, useState } from 'react';
import axios from 'axios';
// TODO: I think this constant shouldn't be open to public
import { BACKEND_SVR_URL } from "../util/constants";
// import express from 'express'



// console.log(__dirname)
export const EmailSignUp = () => {
  // console.log(path.resolve(__dirname, '../' ))
  
  // dotenv.config(); 


  const regex = new RegExp('[a-z0-9]+@[a-z]+[.][a-z]{2,}');
  let testEmails = ["notanemail@.com", "notanemail@com.ab", "workingexample@email", "another_working@somethingelse.org", "notworking@1.com"];

  testEmails.forEach((address, idx) => {
      console.log(`reg test : ${idx}`, regex.test(address))
  });
  
  const [emailField, setEmailField] = useState("");
  const [emailAddrValidation, setEmailAddrValidation] = useState(false)
  const [clickCnt, setclickCnt] = useState(0);
  // clickChanged is designed to detect the change of clicked value
  // clicked becomes 0 -> 1 and it also becomes 1 and then instantly reset to 0
  const [clickChanged, setclickChanged] = useState(false);
  // validation should be done right after click. 
  const handleChange = (event) => {
    setEmailField(event.target.value);
  }
  const handleClick = (event) =>{
    setclickCnt(clickCnt+1);
    setclickChanged(true);
    if(regex.test(emailField))
    {
      setEmailAddrValidation(true) 
    }else{  
      setEmailAddrValidation(false)   
    }
    
  }
  /* Query POST request to Server / Effect HOOk?  */
  /* How to inject props into the body of payload with Axios post request?
  Good thing */ 
  useEffect( () => {
    if(clickChanged&&emailAddrValidation)
    {
      const apiReqString = `${BACKEND_SVR_URL}/database/subscribe`
      // Just in case for the future extension of this feature 
      // leave firstname and lastname columns here 
      // TODO: email address should be regex inpected with xxxx@xxxx.xxx form
      const data = {
        "firstname" : "",
        "lastname" : "",
        "email" : `${emailField}`      
       }
       console.log("data  ",data)
      // Resetting clickchange right away to prevent unwanted execution of sending api request
      // TODO: not sure if its logic is correct  
      axios.post(apiReqString, data)
            .then((res)=> {
              console.log(res);
            })
            .catch(err => console.log(err))
            .finally(() => {
              // Reset state hooks
              setclickChanged(false);
              setEmailAddrValidation(false);
              setEmailField("");
            })        
      

    }else{
      
      setclickChanged(false);
      setEmailAddrValidation(false);
      setEmailField("")
      console.log("sign up request is not sent due to wrong email address")
    }

  }, [clickCnt] )
  
  return (
    <div>
        
        <h1>
            Find a job that helps you pay down student debt or lowers the cost of your education
        </h1>
        
        <p>Get weekly alerts for new job postings</p>

{/* TODO : regular expression for email address filtering  */}

{/* Either of forms should be displayed depending on the button event */}
        {(clickCnt === 0 || emailAddrValidation === false )&&<form className='before-subscribe form-component'>

            <input type="email" placeholder='Type Your Email' value={emailField} onChange={handleChange}/>
            <button type="button" onClick={handleClick} disabled = {emailField===""}>Sign up for Free</button>

        </form>}
        {/* @Bethold I guess you can prettify below form? */}
        {(clickCnt > 0 && emailAddrValidation)&&<form className='after-subscribe'>
            <p> Thanks for subscribing. </p>
          
        </form>}
    </div>
  )
}
