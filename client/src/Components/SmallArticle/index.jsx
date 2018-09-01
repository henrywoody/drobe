import React from 'react';
import './style.css';

export default props => {
	const { name, imageUrl, clickIcon, onClick } = props;

	return (
		<div className='small-article' onClick={ onClick }>
			{ clickIcon && <span className='click-icon'>{ clickIcon }</span> }

			{ imageUrl && (
				<div className='img-container'>
					<img src={ imageUrl } alt='article'/>
				</div>
			)}
			
			<span>{ name }</span>
		</div>
	)
}