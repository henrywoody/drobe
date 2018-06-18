import React, { Component } from 'react';

export default class SimpleArticle extends Component {
	render() {
		const { data, selectArticle } = this.props;

		const img = data.image ? (
			<img src={ data.image }/>
		) : (
			null
		);

		return (
			<div>
				<h3>{ data.name }</h3>

				<button onClick={ () => selectArticle(data) }>Select</button>

				{ img }

				<p>{ data.description }</p>
			</div>
		);
	}
}