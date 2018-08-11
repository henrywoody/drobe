import React from 'react';
import { NavLink } from 'react-router-dom';

export default props => {
	return (
		<nav>
			<NavLink exact to='/' activeClassName='nav-active'>Home</NavLink>
			<NavLink to='/wardrobe' activeClassName='nav-active'>Wardrobe</NavLink>
			<NavLink exact to='/logout' activeClassName='nav-active'>Logout</NavLink>
		</nav>
	)
}