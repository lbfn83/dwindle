import React from 'react'

export const JobPostSearch = () => {
  return (
    <div>
        
        <h1>
            Want to work for a company that helps you pay down your student debt?
        </h1>
        
        <p>We only list jobs that provide student loan repayment, tuition assistance, and tuition reimbursement benefits</p>

        <form className='form-component'>

            <input type="input" placeholder='keywords' />
            <input type="ipnut" placeholder='Location' />
            <button>Find Jobs</button>

        </form>

    </div>
  )
}
