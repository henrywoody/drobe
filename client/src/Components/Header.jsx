import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export default class Header extends Component {
	render() {
		const { links } = this.props;

		const navLinks = links.map(link => {
			return <NavLink key={ link.name } exact={ link.exact } to={ link.href } activeClassName='nav-active'>{ link.name }</NavLink>
		});

		return (
			<header>
				<span id='title'>Drobe</span>

				<nav>
					{ navLinks }
				</nav>
			</header>
		);
	}
}