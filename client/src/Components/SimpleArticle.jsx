import React, { Component } from 'react';
import pluralizeArticleKind from '../Modules/pluralize-article-kind';

export default class SimpleArticle extends Component {
	handleClick = () => {
		const { data, history } = this.props;
		const pluralArticleKind = pluralizeArticleKind(data.articleKind);
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