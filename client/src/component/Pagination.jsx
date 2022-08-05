import React from 'react'

const Pagination = ({next, previous}) => {
    

  return (
    <div className="pagination">
        <div onClick={()=>previous()}>
            <p>Previous</p>
        </div>
        
        <div onClick={()=>next()}>
            <p>Next</p>
        </div>
        

    </div>
  )
}

export default Pagination