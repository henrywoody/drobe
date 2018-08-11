import React from 'react';

export default props => {
	const { name, imageUrl, onClick, field, id } = props;

	return (
		<div onClick={ () => onClick(field, id) }>
			<img src={ imageUrl } alt='image'/>
			<span>{ name }</span>
		</div>
	)
}