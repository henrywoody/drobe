import React from 'react';
import './style.css';

export default props => {
	return (
		<div className='loader'>
			<div className='lds-ripple'>
				<div></div>
				<div></div>
			</div>
		</div>
	)
}