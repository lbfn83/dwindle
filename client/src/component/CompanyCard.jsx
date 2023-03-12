import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { BACKEND_SVR_URL } from '../util/constants'

export const CompanyCard = ( {companyData} ) => {

    const [compData, setCompData] = useState([])

    //data from companylistpage.jsx
    const { uuid, company_name } = companyData

    const navigate = useNavigate()



    useEffect(() => {    
        const getCompanyData = async () => {
            const response = await fetch(`${BACKEND_SVR_URL}/database/company/${uuid}`, {
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors',
            })
            const data = await response.json()
            setCompData(data)
        }
        getCompanyData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const toCompanyPage = async() => {
        navigate(`/companies/benefits/${company_name}`, {
            state:{
                uuid: compData.uuid,
                name: compData.company_name, 
                jobs: compData.company_jobpage, 
                website: compData.company_website, 
                companyindustry: compData.industry, 
                image: compData.imagelink, 
                summary: compData.company_summary, 
                description: compData.company_description, 
            }})
    }
    return (
        <div className='company-card'>
            <div>
                <div onClick={toCompanyPage} className='company-page-link' >
                    <div className='image-box'>
                        <img src={compData.imagelink} alt={company_name}/>
                    </div>
                    <p>{company_name}</p>
                
                    <div className='tag-container'>
                        <span className='tag'>
                            <span className='tag-text'>
                                {compData.industry}
                            </span>
                        </span>
                    </div>
                </div>
                <div className='social-buttons-container'>
                    <ul className='social-buttons-list'>
                        <li className='social-buttons-item'>
                            <a className='social-buttons-link' href={compData.company_website} target="_blank" rel="noreferrer">
                                <img className='social-button-icon' alt="Jobs icon" src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/black/link.svg"/>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
