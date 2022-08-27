import React from 'react'
import { Link } from 'react-router-dom';

const MobileNav = (open) => {

  return (
    <ul className='nav-mobile' style={{display: open.open ? 'flex' : 'none'}}>
          {/* <ul className='nav-mobile' style={display}></ul> */}
        <li className="nav-mobile-option"><Link to="/">Jobs</Link></li>
        {/* <li className="nav-option"><Link to="/">Jobs</Link></li> */}
        <li className="nav-mobile-option"><Link to="/companies">Companies</Link></li>
        <li className="nav-mobile-option"><Link to="/benefit">Benefits</Link></li>
        {/* <li className="nav-option"><a href='/'>Community</a></li> */}
        <li className="nav-mobile-option"><Link to="/blog">Blog</Link></li>
        <li className="nav-mobile-option"><Link to="/partners">Partners</Link></li>
        <button>Add a Company</button>
    </ul>
  )
}

export default MobileNav;
