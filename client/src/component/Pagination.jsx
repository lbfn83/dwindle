import React from 'react'

const Pagination = ({next, previous}) => {
    

  return (
    <div className="pagination">
        <div onClick={()=>previous()}>
            <p>&#8592; Previous</p>
        </div>
        
        <div onClick={()=>next()}>
            <p>&#8594; Next</p>
        </div>
        

    </div>
  )
}

export default Pagination