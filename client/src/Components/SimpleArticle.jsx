import React, { Component } from 'react';

export default class SimpleArticle extends Component {
	handleClick = () => {
		const { data, history } = this.props;
		const kind = data.kind.toLowerCase() + (data.kind === 'Pants' ? '' : 's');
		history.replace(`/wardrobe/${kind}/${data._id}`);
	}

	render() {
		const { data } = this.props;

		return (
			<div onClick={ this.handleClick }>
				<span>{ data.name }</span>

				<img src={ data.image } alt='image'/>

				<p>{ data.description }</p>
			</div>
		);
	}
}