import React, { Component } from 'react';

export default class SmallArticle extends Component {
	handleClick = () => {
		const { onClick, field, id } = this.props;
		onClick(field, id);
	}

	render() {
		const { name, imageUrl } = this.props;

		return (
			<div onClick={ this.handleClick }>
				<img src={ imageUrl } alt='image'/>
				<span>{ name }</span>
			</div>
		)
	}
}