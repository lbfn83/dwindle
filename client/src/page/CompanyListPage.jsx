import React, { useState } from 'react'
import { useEffect } from 'react'

import { CompanyCard } from '../component/CompanyCard'

// const companyData = () => {
//     fetch("http://localhost:5000/database/company")
//     .then(response => response.json())
//     .then(data => JSON.stringify(data))
// }

export const CompanyListPage = () => {

    const [companyData, setCompanyData] = useState([])


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
        <div className='header-container'>
            <h1>
                View Thousands of jobs
            </h1>
            <p>Each company listed either provides student loan repayment, tuition reimbursement, or tuition assistance benefits.</p>

            <p>Click the links within the company profiles below to view open jobs at companies that care about your future.</p>
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
