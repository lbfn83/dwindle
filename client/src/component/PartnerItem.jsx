import React from 'react'

export const PartnerItem = ({ partners }) => {

    const { title, titleInfo, postInfo, image, link, ButtonText } = partners

    return (
        <div className='partner-posts'>
            <div className='image-container'>
                <img alt='' src={image} />
            </div>
            <div className='post-text'>
                <h4>{title}<span>{titleInfo}</span></h4>
                <p>{postInfo}</p>                
                <div className='button-box'>
                    <a href={link}>{ButtonText}</a>
                </div>
            </div>

        </div>


        )
}
