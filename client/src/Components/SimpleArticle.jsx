import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export default class SimpleArticle extends Component {
	handleClick = () => {
		const { data, history } = this.props;
		const kind = data.kind.toLowerCase() + (data.kind === 'Pants' ? '' : 's');
		history.replace(`/wardrobe/${kind}/${data._id}`);
		// <NavLink exact to={ `wardrobe/${kind}/${data._id}` }>Select</NavLink>

	}

	render() {
		const { data } = this.props;

		const img = data.image ? (
			<img src={ data.image }/>
		) : (
			null
		);

		return (
			<div onClick={ this.handleClick }>
				<h3>{ data.name }</h3>

				{ img }

				<p>{ data.description }</p>
			</div>
		);
	}
}