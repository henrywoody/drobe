import React from 'react';
import { NavLink } from 'react-router-dom';

export default props => {
	const { className, hideDrawer, handleDrawerClick } = props;

	return (
		<nav className={ `${ className } logged-in ${ className === 'nav-drawer' && hideDrawer ? 'hidden' : ''}` }>
			<NavLink exact to='/' activeClassName='active' onClick={ handleDrawerClick }>Home</NavLink>
			<NavLink to='/wardrobe' activeClassName='active' onClick={ handleDrawerClick }>Wardrobe</NavLink>
			<NavLink exact to='/logout' activeClassName='active' onClick={ handleDrawerClick }>Logout</NavLink>
		</nav>
	)
}