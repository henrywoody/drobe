import React from 'react';
import './style.css';

export default props => {
	const { items, activeItem, handleClick } = props;

	const lis = items.map(item => {
		const capitalizedItem = item.charAt(0).toUpperCase() + item.slice(1);
		return<li className={ item === activeItem ? 'active' : '' } key={ item }><a onClick={ handleClick }>{ capitalizedItem }</a></li>
	});

	return (
		<ul className='subnav'>
			{ lis }
		</ul>
	)
}