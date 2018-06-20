import React, { Component } from 'react';

export default class SmallArticle extends Component {
	handleClick = () => {
		const { onClick, field, id } = this.props;
		onClick(field, id);
	}

	render() {
		const { name, image } = this.props;

		return (
			<div onClick={ this.handleClick }>
				<img src={ image }/>
				<span>{ name }</span>
			</div>
		)
	}
}