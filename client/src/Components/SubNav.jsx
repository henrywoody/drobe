import React, { Component } from 'react';

export default class SubNav extends Component {
	render() {
		const { items, handleClick } = this.props;

		const lis = items.map(item => <li key={ item }><a onClick={ handleClick }>{ item }</a></li>);

		return (
			<ul className='subnav'>
				{ lis }
			</ul>
		)
	}
}