import React, { useState } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'


import { CompanyCard } from '../component/CompanyCard'


export const CompanyListPage = () => {

    const [companyData, setCompanyData] = useState([])

    const location = useLocation()
    const { state } = location
    const { Title, PageTitle, PageInfo, Image} = state


    const getData = async() => {
        const response = await fetch('http://localhost:5000/database/company')
        const data =  await response.json()
        setCompanyData(data)
    } 
    useEffect(() => {
        getData()
    }, [])

  return (
    <div className='content-container'>
        <div className='companylist-header-container'>
            <div className='companylist-header-text'>
                <h1>
                    {PageTitle}
                </h1>
                <p>{PageInfo}</p>
            </div>
            <div>
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
        {/* <CompanyCard companyData={companyData}/> */}
        {/* <button onClick={response}>button</button> */}
    </div>
  )
}
