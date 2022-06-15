import React from 'react'

export const CompanyPage = () => {
  return (
    <div className='content-container'>
        <div className='company-intro-container'>
            <div className='company-title-intro'>
                <h1>Abbot</h1>
                <p>Abbott's life-changing technology helps people live fully and offers information, medicines and breakthroughs to help you manage your health.</p>
                <div className='company-button'>
                    <a href="https://www.jobs.abbott/us/en/search-results?utm_source=dwindlestudentdebt.com&utm_medium=dwindlestudentdebt.com&utm_campaign=dwindlestudentdebt.com&ref=dwindlestudentdebt.com&source=dwindlestudentdebt.com">
                        <span>View Jobs</span>
                    </a>
                </div>
            </div>
            <div>
                <img src='https://via.placeholder.com/400' alt=''/>
            </div>
        </div>
        <div className='company-description-container'>
            <div className='who-we-are'>
                <h2>Who we are</h2>
                <div>           
                    <p>Abbott is a global healthcare leader that helps people live more fully at all stages of life. Our portfolio of life-changing technologies spans the spectrum of healthcare, with leading businesses and products in diagnostics, medical devices, nutritionals and branded generic medicines. Our 113,000 colleagues serve people in more than 160 countries.</p>
                </div>
    
            </div>
            <div className='our-education-benefits'>
                <h2>Our Education Benefits</h2>
                <div>
                    <h3>Freedom 2 Save</h3>
                    <div>
                        <p>Abbott’s Freedom 2 Save (F2S) program addresses our belief that employees shouldn’t have to choose between paying off student loans and saving for retirement. Under the plan, employees who are currently repaying a student loan, and these payments equal at least two percent of their eligible pay, will receive a five percent company match deposited into their Abbott Stock Retirement Plan (SRP) account without having to make contributions to the SRP. If you are enrolled in F2S and making your own contributions to the SRP, you will only receive the F2S matching contribution. All employees who are eligible to participate in the SRP are eligible to enroll in F2S on their first day of employment.</p>
                    </div>
                </div>
                <div>
                    <h3>Tuition Assitance</h3>
                    <div>
                        <p>We provide ongoing opportunities and support for employees to learn and grow. Employees (including newly hired employees) with at least one year of full-time business experience can take advantage of our generous tuition assistance program. This program reimburses employees for business-relevant classes at 100 percent up to $7,000 per year for undergraduate classes and $10,000 per year for graduate classes.</p>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
  )
}
