import React from 'react'
import { useNavigate } from "react-router-dom"

export const CompanyCard = ( {companyData} ) => {

    const { companyname, companyjobpage, companywebsite, industry, imagelink, companysummary, companydescription, benefitdetails, } = companyData

    const navigate = useNavigate()

    const toCompanyPage = () => {
        navigate(`/companies/benefits/${companyname}`, {state:{name: companyname, jobs: companyjobpage, website: companywebsite, companyindustry: industry, image: imagelink, summary:companysummary, description: companydescription, benefits: benefitdetails }})
    }
    

    return (
        <div className='company-card'>
            <div>
                <div onClick={toCompanyPage} className='company-page-link' >
                    <div className='image-box'>
                        <img src={imagelink} alt={companyname}/>
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
