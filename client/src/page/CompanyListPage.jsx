import React from 'react'

import { CompanyCard } from '../component/CompanyCard'

export const CompanyListPage = () => {
  return (
    <div className='content-container'>
        <div className='header-container'>
            <h1>
                View Thousands of jobs
            </h1>
            <p>Each company listed either provides student loan repayment, tuition reimbursement, or tuition assistance benefits.</p>

            <p>Click the links within the company profiles below to view open jobs at companies that care about your future.</p>
        </div>

        <CompanyCard />

    </div>
  )
}
