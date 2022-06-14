import React from 'react'
import { Link } from 'react-router-dom';

export const CompanyCard = () => {
  return (
    <div className='company-card'>
        <div>
            <Link to="/abbott" className='company-page-link'>
                <div className='image-box'>
                    <img src="https://ucarecdn.com/ec44459c-9002-4b40-a6bc-c556351ac4dd/abbott-logo-500x313.png" alt="Abbott logo 500x313"/>
                </div>
                <p>Abbott</p>
            
                <div className='tag-container'>
                    <span className='tag'>
                        <span className='tag-text'>
                            Hospitality & Healthcare
                        </span>
                    </span>
                </div>
            </Link>
            <div className='social-buttons-container'>
                <ul className='social-buttons-list'>
                    <li className='social-buttons-item'>
                        <a className='social-buttons-link' href="https://www.jobs.abbott/us/en/" target="_blank" rel="noreferrer">
                            <img className='social-button-icon' alt="Jobs icon" src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/black/link.svg"/>
                        </a>
                    </li>
                    <li className='social-buttons-item'>
                        <a className='social-buttons-link' href="https://www.linkedin.com/company/abbott-/jobs/" target="_blank" rel="noreferrer">
                            <img className='social-button-icon' alt="linkedin icon" src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/black/linkedin.svg"/>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  )
}
