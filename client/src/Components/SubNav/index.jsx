import React from 'react';

export default props => {
	const { items, handleClick } = props;

	const lis = items.map(item => <li key={ item }><a onClick={ handleClick }>{ item }</a></li>);

	return (
		<ul className='subnav'>
			{ lis }
		</ul>
	)
}