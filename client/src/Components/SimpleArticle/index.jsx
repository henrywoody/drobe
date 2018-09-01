import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import pluralizeArticleKind from '../../Modules/pluralize-article-kind';
import './style.css';

class SimpleArticle extends Component {
	handleClick = () => {
		const { data, history } = this.props;
		const pluralArticleKind = pluralizeArticleKind(data.articleKind);
		history.push(`/wardrobe/${pluralArticleKind}/${data.id}`);
	}

	render() {
		const { data } = this.props;

		return (
			<div className='article-simple' onClick={ this.handleClick }>
				<span className='name'>{ data.name }</span>

				{ data.imageUrl &&
					<img src={ data.imageUrl } alt='article'/>
				}

				<p className='description'>{ data.description }</p>
			</div>
		);
	}
}

export default withRouter(SimpleArticle);