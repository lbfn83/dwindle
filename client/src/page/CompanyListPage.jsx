import React, { useState } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'


import { CompanyCard } from '../component/CompanyCard'


export const CompanyListPage = () => {

    const [companyData, setCompanyData] = useState([])

    const location = useLocation()

    // data gathered from CompanyBenefitCard.jsx
    const { state } = location
    const { Title, PageTitle, PageInfo, Image, BenefitType} = state


    const getData = async () => {
        const response = await fetch(`https://dwindle-backend-server.herokuapp.com/database/companies/benefit/${BenefitType}`, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors',
        })
        const data =  await response.json()
        setCompanyData(data[0])
        console.log(data[0])
    } 
    
    useEffect(() => {
        getData()
    }, [])


  return (
    <div className='content-container'>
        <div className='header'>
            <div className='header-text-container'>
                <h1>
                    {PageTitle}
                </h1>
                <p>{PageInfo}</p>
            </div>
            <div className='header-image-container'>
                <img src={Image} alt={Title} />
            </div>
            
        </div>
        <div className='title-container'>
            <h2>{Title}</h2>
            <p>Click the Company Card to learn more!</p>
        </div>

        <div className='card-list-container'>
            {companyData.map((companyData, id) => (
                <CompanyCard key={id} companyData={companyData} />
            ))}
        </div>

    </div>
  )
}
