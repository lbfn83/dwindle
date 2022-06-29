import { PartnersDirectory } from '../component/PartnersDirectory'

import React from 'react'

export const PartnersPage = () => {



    return (
        <div className='partner-page content-container'>
            <div className='partner-title-container'>
                <h1>Partners</h1>
                <p>We wouldnt be able to help as many people witout our partners!</p>
                <p>If you're intersted in jelping us with our mission to provide the best resources to combat the student devbt crisis continue reading this page</p>
            </div>

            <PartnersDirectory />
        
        </div>
    )
}
