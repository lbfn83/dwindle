import React from 'react'
import { useNavigate } from "react-router-dom"

export const CompanyCard = ( {companyData} ) => {

    const { companyname, companyjobpage, companywebsite, industry, compaydescription, benefitdetails, linktobenefitdetails } = companyData

    const navigate = useNavigate()

    const toCompanyPage = () => {
        navigate(`/companies/${companyname}`, {state:{name: companyname, jobs: companyjobpage, website: companywebsite, companyindustry: industry, description: compaydescription, benefits: benefitdetails, links: linktobenefitdetails }})
    }
    

    return (
        <div className='company-card'>
            <div>
                <div onClick={toCompanyPage} className='company-page-link' >
                    <div className='image-box'>
                        <img src="https://ucarecdn.com/ec44459c-9002-4b40-a6bc-c556351ac4dd/abbott-logo-500x313.png" alt="Abbott logo 500x313"/>
                    </div>
                    <p>{companyname}</p>
                
                    <div className='tag-container'>
                        <span className='tag'>
                            <span className='tag-text'>
                                {industry}
                            </span>
                        </span>
                    </div>
                </div>
                <div className='social-buttons-container'>
                    <ul className='social-buttons-list'>
                        <li className='social-buttons-item'>
                            <a className='social-buttons-link' href={companywebsite} target="_blank" rel="noreferrer">
                                <img className='social-button-icon' alt="Jobs icon" src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/black/link.svg"/>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
