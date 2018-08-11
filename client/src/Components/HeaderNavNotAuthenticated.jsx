import React from 'react';
import { NavLink } from 'react-router-dom';

export default props => {
	return (
		<nav>
			<NavLink exact to='/' activeClassName='nav-active'>Login</NavLink>
			<NavLink exact to='/register' activeClassName='nav-active'>Register</NavLink>
		</nav>
	)
}