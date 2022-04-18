import React from 'react';
import { JobPage } from './page/JobPage';
import { Navbar } from './component/Navbar';

import logo from './images/dwindleTMbigfinal.png'

import './App.css'

function App() {
  return (
    <div className='site-container'>
      <div className='title-bar'>
        <div className='logo-image-container'><img src={logo} /></div> 
        <button>Post a Job</button>
      </div>

      <div className='page-container'>
        <Navbar />
        <JobPage />
      </div>

    </div>
  );
}

export default App;
