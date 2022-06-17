import React from 'react'

import { useLocation } from 'react-router-dom';

export const CompanyPage = () => {

    const location = useLocation()

    const { state } = location

    const { name, desc, benefitTitle1, benefitTitle2, beneDesc1, benDesc2 } = state

    return (
        <div className='content-container'>
            <div className='company-intro-container'>
                <div className='company-title-intro'>
                    <h1>{name}</h1>
                    <p>Abbott's life-changing technology helps people live fully and offers information, medicines and breakthroughs to help you manage your health.</p>
                    <div className='company-button'>
                        <a href="https://www.jobs.abbott/us/en/search-results?utm_source=dwindlestudentdebt.com&utm_medium=dwindlestudentdebt.com&utm_campaign=dwindlestudentdebt.com&ref=dwindlestudentdebt.com&source=dwindlestudentdebt.com">
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
                        <p>{desc}</p>
                    </div>
        
                </div>
                <div className='our-education-benefits'>
                    <h2>Our Education Benefits</h2>
                    <div>
                        <h3>{benefitTitle1}</h3>
                        <div>
                            <p>{beneDesc1}</p>
                        </div>
                    </div>
                    <div>
                        <h3>{benefitTitle2}</h3>
                        <div>
                            <p>{benDesc2}</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
