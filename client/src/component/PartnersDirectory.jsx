import { PartnerItem } from './PartnerItem'
import React from 'react'

export const PartnersDirectory = () => {
  const partners =[
    {
      title: 'Sparrow',
      titleInfo: 'Student Loan Refinancing',
      postInfo: 'Sparrow allows users to search and compare personalized student loan offers through a single application. Click below to learn more:',
      image: 'https://ucarecdn.com/3d1ba4b6-8179-49f5-a780-5c417252d983/sparrowfi-logo.png',
      link: 'https://www.sparrowfi.com/?utm_source=dwindlestudentdebt.com&utm_medium=dwindlestudentdebt.com&utm_campaign=dwindlestudentdebt.com&ref=dwindlestudentdebt.com&source=dwindlestudentdebt.com/',
      ButtonText:'Refinance' 
    },
    {
        title: 'Dolr',
        titleInfo: 'Lower Your Student Loan Payments',
        postInfo: 'Dolr gets you more money for student loan repayment from where you shop and work so you can get to $0 debt earlier. Check out their website below:',
        image: 'https://ucarecdn.com/6dfa986a-e0ee-481c-ba88-1946a567f6bd/dolr.png',
        link: 'https://www.getdolr.com/',
        ButtonText:'Get Dolr' 
    },
    {
        title: 'TopResume',
        titleInfo: 'Resume Experts',
        postInfo: 'DTopResume has helped over one million job-seekers change careers and they want to help you, too! Get your free resume review below:',
        image: 'https://ucarecdn.com/7176996c-4ec4-41fd-91c5-562acfab90ac/top-resume.png',
        link: 'https://www.topresume.com/resume-review?pt=P9jdGRwKaPu3K&utm_medium=referral&utm_source=Dwindle+Student+Debt',
        ButtonText:'Free Resume Review'
    },
    {
        title: 'A ColorFul Life',
        titleInfo: 'Career Coaching',
        postInfo: 'Keiko Roy-Carey is an incredible career coach who has helped many on their job search. Schedule a complimentary call below:',
        image: 'https://ucarecdn.com/461e41ec-10bd-45a9-b8b8-b92de5cfac7d/a-colorful-life.png',
        link: 'https://www.colorfullifecoaching.com/',
        ButtonText:'Schedule a call'
    },
    
]


  return (
          
    <div className='partners-section'>
        {partners.map((partners, id) => (
          <PartnerItem key={id} partners={partners}/>
        ))}
    </div>
      
      
  )
}
