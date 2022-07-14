import React from 'react'

export const Subscribe = () => {
  return (
    <div className='page-container'>
        <div className='content-container'>
            <div className='subscribe-container'>
                <div className='subscribe-text-container'>
                    <div>
                        <h1>Subscribe to our monthly newsletter</h1>
                    </div>
                    <div className='subscribe-list-container'>
                        <ul>
                            <li>Giveaways</li>
                            <li>Success stories</li>
                            <li>Student loan news</li>
                            <li>FREE budget tracker</li>
                            <li>Who's hiring with student loan repayment benefits</li>
                            <li>Potentially be chosen to receive a payment towards your student loan balance</li>
                        </ul>
                    </div>
                </div>
                <div className='subscribe-input-container'>
                    <input type="email" /> 
                    <button>Subscribe</button>
                </div>
            </div>
        </div>
    </div>
  )
}
