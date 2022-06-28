import React from 'react'
import { CompanyBenefitList } from '../component/CompanyBenefitList'

export const CompaniesSectionPage = () => {
  return (
    <div>
        <div className='company-section-header'>
            <div className='company-text-container'>
                <h1>
                    Companies that pay down your student debt or pay for your degree
                </h1>
                <p>We've compiled a list of companies that provide student loan repayment, 100% tuition coverage, tuition assistance, and tuition reimbursement benefits. </p>
            </div>
            <div className='company-header-image-container'>
                <img src="https://ucarecdn.com/d4e07fb5-91c2-4ca7-b236-a786c400b0d6/undraw-lightbulb-moment-re-ulyo.png" alt="Undraw lightbulb moment re ulyo" />
            </div>
        </div>
        <CompanyBenefitList />
    </div>
  )
}
