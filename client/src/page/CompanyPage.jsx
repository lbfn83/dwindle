import React from 'react'

import { useLocation } from 'react-router-dom';

export const CompanyPage = () => {

    const location = useLocation()

    const { state } = location

    const { name, jobs, website, companyindustry, description, benefits, links } = state

    return (
        <div className='content-container'>
            <div className='company-intro-container'>
                <div className='company-title-intro'>
                    <h1>{name}</h1>
                    <p>Abbott's life-changing technology helps people live fully and offers information, medicines and breakthroughs to help you manage your health.</p>
                    <div className='company-button'>
                        <a href={jobs}>
                            <span>View Jobs</span>
                        </a>
                    </div>
                </div>
                <div>
                    <img src='https://via.placeholder.com/400' alt=''/>
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
                        <p>{benefits}</p>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
