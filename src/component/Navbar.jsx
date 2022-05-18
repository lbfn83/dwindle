import React, { useState } from 'react'

import burgerMenu from '../images/icons8-menu.svg'

export const Navbar = () => {
  const [open, setOpen] = useState(false)


  return (

    <div className="nav-container">  
        <div className="burger-menu" onClick={() => setOpen(!open)}><img src={burgerMenu} alt='' /></div>

        <ul className='nav-list'>
            <li className="nav-option"><h3>About</h3></li>
            <li className="nav-option"><a>Jobs</a></li>
            <li className="nav-option"><a>Companies</a></li>
            <li className="nav-option"><a>Benefits</a></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/community/'>Community</a></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/blog/'>Blog</a></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/partners/'>Partners</a></li>
        </ul>
                
        <ul className='nav-mobile' style={{display: open ? 'block' : 'none'}}>
            <li className="nav-option"><a href="#">About</a></li>
            <li className="nav-option"><a href="#">Jobs</a></li>
            <li className="nav-option"><a href="#">Companies</a></li>
            <li className="nav-option"><a href="#">Benefits</a></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/community/'>Community</a></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/blog/'>Blog</a></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/partners/'>Partners</a></li>
        </ul>
      

    </div>
  )
}
