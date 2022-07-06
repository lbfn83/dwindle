import React from 'react'
import { CompanyBenefitCard } from './CompanyBenefitCard'

export const CompanyBenefitList = () => {
    const benefits = [
        {
            title: 'Student Loan Repayment',
            pageTitle: 'Companies with student loan repayment benefits',
            pageInfo: "We've compiled a list of companies that provide student loan repayment benefits.",
            image: 'https://ucarecdn.com/6f268443-6f26-4e74-9636-c515b75df1b3/',
            benefitType: 'student_loan_repayment'
        },
        {   
            title: '100% Tuition Coverage',
            pageTitle: 'Companies with 100% tuition coverage. Earn your degree, debt-free.',
            pageInfo: "We've compiled a list of companies with 100% tuition coverage.",
            image: 'https://ucarecdn.com/ab3522da-effe-4a0e-ac28-5fa306fdbcd6/100--tuition-coverage-page.png',
            benefitType: 'full_tuition_coverage'
        },
        {
            title: 'Tuition Assistance',
            pageTitle: 'Companies with tuition assistance benefits.',
            pageInfo: "We've compiled a list of companies that provide tuition assistance benefits.",
            image: 'https://ucarecdn.com/f96e8793-e80b-4af6-83b8-febc479b2ea3/tuition-assistance-page.png',
            benefitType: 'tuition_assistance'
        },
        {
            title: 'Tuition Reimbursement',
            pageTitle: 'Companies with tuition reimbursement benefits',
            pageInfo: "We've compiled a list of companies that provide tuition reimbursement benefits.",
            image: 'https://ucarecdn.com/a9fff551-02da-4d87-b8aa-c0e5051b2344/tuition-reimbursement-page.png',
            benefitType: 'tuition_reimbursement'
        }
    ]


    return (
        <div className='company-benefit-list'>
            {benefits.map((benefit, id) => (
                <CompanyBenefitCard key={id} benefits={benefit}/>
            ))}
            
        </div>
    )
}
