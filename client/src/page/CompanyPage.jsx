import React, { useState, useEffect } from 'react'

import { useLocation } from 'react-router-dom';

import EmailSignup, { EmailSignUp } from '../component/EmailSignUp'

import { BACKEND_SVR_URL } from '../util/constants'

export const CompanyPage = () => {

    const location = useLocation()

    const { state } = location

    const { uuid ,name, jobs, image, summary, description} = state

    const [ benefitDetails, setBenefitDetails ] = useState([])

    const getBenefitData = async () => {
        const response = await fetch(`${BACKEND_SVR_URL}/database/company/${uuid}/benefit`, { 
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors',
        })
        const data = await response.json()
        setBenefitDetails(data.benefits)
    
        
    }
    useEffect(() => {
        getBenefitData()
    }, [])
    // console.log(benefitDetails)

    const fixString = (string) => {
        const noUnderscore = string.replaceAll("_", " ")

        const words = noUnderscore.split(" ")

        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }

        return words.join(" ");
    }

    return (
        <div className='content-container'>
            <div className='header'>
                <div className='header-text-container'>
                    <h1>{name}</h1>
                    <p>{summary}</p>
                    <div className='company-button'>
                        <a href={jobs}>
                            <span>View Jobs</span>
                        </a>
                    </div>
                </div>
                <div>
                    <img src={image} alt={name}/>
                </div>
            </div>
            <div className='company-description-container'>
                <div className='who-we-are'>
                    <h2>Who we are</h2>
                    <div>           
                        <p>{description}</p>
                    </div>
        
                </div>
                <div className='our-education-benefits'>
                    <h2>Our Education Benefits</h2>
                    <div>
                        {benefitDetails.map((benefit, key) =>
                            <div key={key}>
                                <h3>{fixString(benefit.benefit_type)}</h3>
                                <p>{benefit.benefit_details}</p>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
            <EmailSignUp />
        </div>
    )
}
