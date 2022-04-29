import React from 'react'
import { EmailSignUp } from '../component/EmailSignUp'
import { JobPostSearch } from '../component/JobPostSearch'
import Search from '../component/Search';

export const JobPage = () => {
  return (
    <div className='job-page-body'>
        
      <EmailSignUp />
      <JobPostSearch />
      <Search />
        
    </div>
  )
}
