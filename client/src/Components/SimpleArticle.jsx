import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export default class SimpleArticle extends Component {
	render() {
		const { data } = this.props;

		const img = data.image ? (
			<img src={ data.image }/>
		) : (
			null
		);

		const kind = data.kind.toLowerCase() + (data.kind === 'Pants' ? '' : 's');

		return (
			<div>
				<h3>{ data.name }</h3>

				<NavLink exact to={ `wardrobe/${kind}/${data._id}` }>Select</NavLink>

				{ img }

				<p>{ data.description }</p>
			</div>
		);
	}
}