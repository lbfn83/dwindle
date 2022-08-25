import React from 'react'
// import { Link } from 'react-router-dom';

const MobileNav = (open) => {

  return (
    <ul className='nav-mobile' style={{display: open.open ? 'flex' : 'none'}}>
          {/* <ul className='nav-mobile' style={display}></ul> */}
        <li className="nav-mobile-option"><a href="https://dwindlestudentdebt.com/about/">About</a></li>
        {/* <li className="nav-option"><Link to="/">Jobs</Link></li> */}
        <li className="nav-mobile-option"><a href="https://dwindlestudentdebt.com/companies/">Companies</a></li>
        <li className="nav-mobile-option"><a href="https://dwindlestudentdebt.com/benefits/">Benefit</a></li>
        {/* <li className="nav-option"><a href='/'>Community</a></li> */}
        <li className="nav-mobile-option"><a href='https://dwindlestudentdebt.com/blog/'>Blog</a></li>
        <li className="nav-mobile-option"><a href='https://dwindlestudentdebt.com/partners/'>Partners</a></li>
        <button><a href='https://dwindlestudentdebt.com/add-company/'>Add a Company</a></button>
    </ul>
  )
}

export default MobileNav;