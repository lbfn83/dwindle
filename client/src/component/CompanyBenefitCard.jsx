import React from 'react'
import { useNavigate } from 'react-router-dom'

export const CompanyBenefitCard = ({ benefits }) => {

    const { title, pageTitle, pageInfo, image } = benefits

    const navigate = useNavigate()

    const toCompanyListPage = () => {
        navigate(`/companies/benefits`, {state: {Title: title, PageTitle: pageTitle, PageInfo: pageInfo, Image: image}})
    }

    return (
        <div onClick={toCompanyListPage} className='benefit-card-container'>
            <div className='benefit-card-image-container'>
                <img src={image} alt={title} />
            </div>
            <div className='benefit-card-text'>
                <p>{title}</p>
            </div>
            
        </div>
    )
}
