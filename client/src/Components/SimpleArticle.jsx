import React, { Component } from 'react';

export default class SimpleArticle extends Component {
	handleClick = () => {
		const { data, history } = this.props;
		const pluralArticleKind = data.articleKind + (data.articleKind === 'pants' ? '' : 's');
		history.replace(`/wardrobe/${pluralArticleKind}/${data.id}`);
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