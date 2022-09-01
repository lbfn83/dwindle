import React, { useEffect, useState } from 'react';
import axios from 'axios';
// TODO: I think this constant shouldn't be open to public
import { BACKEND_SVR_URL } from "../util/constants";
// import express from 'express'



// console.log(__dirname)
export const EmailSignUp = () => {
  // console.log(path.resolve(__dirname, '../' ))
  
  // dotenv.config(); 

  // Regular expression to filter out strings with the incorrect email format (  xxxx@xxx.xxx )
  const regex = new RegExp('[a-z0-9]+@[a-z]+[.][a-z]{2,}');
  
  /* Regular expressing test
  let testEmails = ["notanemail@.com", "notanemail@com.ab", "workingexample@email", "another_working@somethingelse.org", "notworking@1.com"];

  testEmails.forEach((address, idx) => {
      console.log(`reg test : ${idx}`, regex.test(address))
  });
  */

  const [emailField, setEmailField] = useState("");

  // Email address validation process should be executed right after submission
  // if string is validated as a correct email address form, don't go back to the input form 
  // since one user should submit only one email address
  // 
  // This state is used to diplay sucessful subscribing message
  // Set : When new input string passes Regex inspection
  // Reset : When new input string fails Regex inspection &&  When this component receives error from server
  const [emailAddrValidation, setEmailAddrValidation] = useState(false)
  
  const [clickCnt, setclickCnt] = useState(0);

  // When error comes from server ( usually code 400 with ERR_BAD_REQUEST / SequelizeContraintError)
  // it should be duplicate email address that has been entered in input form
  // Set : When this component receives error from server
  // Reset : When new input string is submitted
  const [registrErr, setRegistrErr] = useState(false);
  const [message, setMessage] = useState("");
  const handleChange = (event) => {
    
    setEmailField(event.target.value);
  }
  
  // validation should be only done right after click. 

  const handleClick = (event) =>{
    // prevent form to be submitted in undefined logic
    event.preventDefault();

    setRegistrErr(false);
    setclickCnt(clickCnt+1);
    
    if(regex.test(emailField))
    {
      setEmailAddrValidation(true); 
    }else{  
      setEmailAddrValidation(false);   
    }
    
  }

  /* Query POST request to Server / Effect HOOk?  */
  /* How to inject props into the body of payload with Axios post request?*/
  useEffect( () => {
    
    if(emailAddrValidation)
    {
      const apiReqString = `${BACKEND_SVR_URL}/database/subscribe`
      // Just in case for the future extension of this feature 
      // leave firstname and lastname columns here 
      const data = {
        "firstname" : "",
        "lastname" : "",
        "email" : `${emailField}`      
       }
       console.log("data  ",data)
      // 
      // TODO: not sure if its logic is correct  
      axios.post(apiReqString, data)
            .then((res)=> {
              console.log('[EmailSignUp]', res);
              setMessage(res.data);
            })
            .catch(err => {
              console.log('[EmailSignUp]', err);
              setRegistrErr(true);
              setEmailAddrValidation(false);
            })
            .finally(() => {
              setEmailField("");
            })        
      

    }else{
      
      // setEmailField("")
      console.log("sign up request is not sent due to wrong email address")
    }

  }, [clickCnt] )
  
  return (
    <div className='email-signup'>
        
        <h1>
            Find a job that helps you pay down student debt or lowers the cost of your education
        </h1>
        
        <p>Get weekly alerts for new job postings</p>

{/* In the context of UI, it has three different states and display any of forms defined below
 depending on state hooks */}

 
            {(emailAddrValidation === false )&&(!registrErr)&&<form className='before-subscribe form-component' onSubmit={handleClick}>


                <input type="text" placeholder='Type Your Email' value={emailField} onChange={handleChange}/>
                <button type="submit"  disabled = {emailField===""}>Sign up for Free</button>
                {/* <input type="button" onClick={handleClick} disabled = {emailField==""}>Sign up for Free</input> */}

            </form>}
            {/* @Bethold I guess you can prettify below form? */}
            {(clickCnt > 0 && emailAddrValidation)&&<form className='after-subscribe form-component'>
                <p> {message} </p>
                {/* <p> Thanks for subscribing. </p> */}
              
            </form>}
            {(clickCnt > 0 && registrErr)&&<form className='duplicate-input'>
                <p> Something went wrong with your subscription. Please contact the website owner </p>
              
            </form>}

    </div>
  )
}
