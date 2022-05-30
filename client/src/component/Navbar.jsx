import React, { useState } from 'react'
// import { Link } from 'react-router-dom';
import burgerMenu from '../images/icons8-menu.svg'

export const Navbar = () => {
  const [open, setOpen] = useState(false)


  return (

    <div className="nav-container">  
        <div className="burger-menu" onClick={() => setOpen(!open)}><img src={burgerMenu} alt='' /></div>

        {/* <ul className='nav-list'>
            <li className="nav-option"><a href="https://dwindlestudentdebt.com/about/">About</a></li>
            <li className="nav-option"><Link to="/">Jobs</Link></li>
            <li className="nav-option"><Link to="/">Companies</Link></li>
            <li className="nav-option"><Link to="/">Benefits</Link></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/community/'>Community</a></li>
            <li className="nav-option"><Link to='/blog'>Blog</Link></li>
            <li className="nav-option"><a href='/partners'>Partners</a></li>
        </ul>
                
        <ul className='nav-mobile' style={{display: open ? 'block' : 'none'}}>
            <li className="nav-option"><a href="https://dwindlestudentdebt.com/about/">About</a></li>
            <li className="nav-option"><Link to="/">Jobs</Link></li>
            <li className="nav-option"><Link to="/">Companies</Link></li>
            <li className="nav-option"><Link to="/">Benefits</Link></li>
            <li className="nav-option"><a href='https://dwindlestudentdebt.com/community/'>Community</a></li>
            <li className="nav-option"><Link to='/blog'>Blog</Link></li>
            <li className="nav-option"><Link to='/partners'>Partners</Link></li>
        </ul> */}
      

    </div>
  )
}
