import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JobPage } from './page/JobPage';
// import { BlogPage } from './page/BlogPage';
// import { PartnersPage } from './page/PartnersPage';
import { Navbar } from './component/Navbar';

import logo from './images/dwindleTMbigfinal.png'

import './App.css'

function App() {
  return (
    <div className='site-container'>
      {/* <BrowserRouter> */}
        <div className='title-bar'>
          <div className='logo-image-container'><img src={logo} alt="dwindle logo" /></div> 
          <button>Post a Job</button>
        </div>

        <div className='page-container'>
          <Navbar />
          {/* <Routes>
            <Route path="/" element={<JobPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/partners" element={<PartnersPage />} />
          </Routes>
           */}
          <JobPage />

        </div>
      {/* </BrowserRouter> */}
    </div>
  );
}

export default App;
