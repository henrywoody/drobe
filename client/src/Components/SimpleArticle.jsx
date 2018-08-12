import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import pluralizeArticleKind from '../Modules/pluralize-article-kind';

class SimpleArticle extends Component {
	handleClick = () => {
		const { data, history } = this.props;
		const pluralArticleKind = pluralizeArticleKind(data.articleKind);
		history.push(`/wardrobe/${pluralArticleKind}/${data.id}`);
	}

	render() {
		const { data } = this.props;

		return (
			<div onClick={ this.handleClick }>
				<span>{ data.name }</span>

				<img src={ data.imageUrl } alt='article'/>

				<p>{ data.description }</p>
			</div>
		);
	}
}

export default withRouter(SimpleArticle);