import React, { useState } from 'react'

import burgerMenu from '../images/icons8-menu.svg'

export const Navbar = () => {
  const [open, setOpen] = useState(false)


  return (

    <div className="nav-container">  
        <div className="burger-menu" onClick={() => setOpen(!open)}><img src={burgerMenu} alt='' /></div>

        <ul className='nav-list'>
            <li className="nav-option"><h3>About</h3></li>
            <li className="nav-option"><h3>Jobs</h3></li>
            <li className="nav-option"><h3>Companies</h3></li>
            <li className="nav-option"><h3>Benefits</h3></li>
            <li className="nav-option"><h3>Community</h3></li>
            <li className="nav-option"><h3>Blog</h3></li>
            <li className="nav-option"><h3>Partners</h3></li>
        </ul>
                
        <ul className='nav-mobile' style={{display: open ? 'block' : 'none'}}>
            <li className="nav-option"><h3>About</h3></li>
            <li className="nav-option"><h3>Jobs</h3></li>
            <li className="nav-option"><h3>Companies</h3></li>
            <li className="nav-option"><h3>Benefits</h3></li>
            <li className="nav-option"><h3>Community</h3></li>
            <li className="nav-option"><h3>Blog</h3></li>
            <li className="nav-option"><h3>Partners</h3></li>
        </ul>
      

    </div>
  )
}
