import React from 'react'

export const PartnersPage = () => {
  return (
    <div className='partner-page'>
        <div className='partner-title-container'>
            <h3>Partners</h3>
            <p>We wouldnt be able to help as many people witout our partners!</p>
            <p>If you're intersted in jelping us with our mission to provide the best resources to combat the student devbt crisis continue reading this page</p>
        </div>

        
        <div className='partners-section'>
            <div className='partner-posts'>
                <div className='image-container dolr'>
                    <img alt='Dolr' src='https://ucarecdn.com/6dfa986a-e0ee-481c-ba88-1946a567f6bd/dolr.png' />
                </div>
                <div className='post-text'>
                    <h4>Dolr<span>Lower Your Student Loan Payments</span></h4>
                    <p>Dolr gets you more money for student loan repayment from where you shop and work so you can get to $0 debt earlier. Check out their website below:</p>                
                    <div className='button-box'>
                        <a href="https://www.getdolr.com/">Get Dolr</a>
                    </div>
                </div>

            </div>
            <div className='partner-posts'>
                <div className='image-container topresume'>
                    <img alt='Top Resume' src='https://ucarecdn.com/7176996c-4ec4-41fd-91c5-562acfab90ac/top-resume.png' />
                </div>
                <div className='post-text'>
                    <h4>TopResume <span>Resume Experts</span></h4>
                    <p>TopResume has helped over one million job-seekers change careers and they want to help you, too! Get your free resume review below:</p>                
                    <div className='button-box'>
                        <a href="https://www.topresume.com/resume-review?pt=P9jdGRwKaPu3K&utm_medium=referral&utm_source=Dwindle+Student+Debt">Free Resume Review</a>
                    </div>
                </div>

            </div>
            <div className='partner-posts'>
                <div className='image-container colorfullife'>
                    <img alt='A Colorful Life' src='https://ucarecdn.com/461e41ec-10bd-45a9-b8b8-b92de5cfac7d/a-colorful-life.png' />
                </div>
                <div className='post-text'>
                    <h4>A ColorFul Life <span>Career Coaching</span></h4>
                    <p>Keiko Roy-Carey is an incredible career coach who has helped many on their job search. Schedule a complimentary call below:</p>                
                    <div className='button-box'>
                        <a href="https://www.colorfullifecoaching.com/">Schedule a call</a>
                    </div>
                </div>

            </div>
        </div>
    
    </div>
  )
}
