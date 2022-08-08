import React from 'react'

const Pagination = ({next, previous, pageNum, arryJobPosting}) => {
    
    const hideDisplay = (page) => {
     return page === 0 ? {display: 'none'} : {display: 'block'}
    }

    const changeJustContent = (page) => {
      return page === 0 ? {justifyContent: 'center'} : {justifyContent: 'space-around'}
    }

    const hideNext = (length) => {
      return length > 0 ? {display: 'block'} : {display: 'none'}
    }
    

  return (
    <div className="pagination" style={changeJustContent(pageNum)}>
        <div onClick={()=>previous()} style={hideDisplay(pageNum)}>
            <p>&#8592;</p>
            <p>Previous</p>
        </div>
        
        <div onClick={()=>next()} style={hideNext(arryJobPosting.length)}>
            <p>&#8594;</p>
            <p>Next</p>
        </div>
        

    </div>
  )
}

export default Pagination