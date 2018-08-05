import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ArticlesIndex from '../Components/ArticlesIndex.jsx';
import DetailedArticle from '../Components/DetailedArticle.jsx'
import ArticleForm from '../Forms/ArticleForm.jsx';

class Wardrobe extends Component {
	render() {
		const { user, articles, updateWardrobe } = this.props;

		return (
			<main>
				<h1>Wardrobe</h1>

				<Switch>
					<Route exact path='/wardrobe' render={ props => <ArticlesIndex { ...props } articles={ articles }/> }/>
					<Route exact path={ `/wardrobe/:pluralArticleKind/:articleId` } render={ props => <DetailedArticle { ...props } existingArticles={ articles } updateWardrobe={ {remove: updateWardrobe.remove} }/> }/>
					<Route exact path={ `/wardrobe/:pluralArticleKind/:articleId/edit` } render={ props => <ArticleForm { ...props } existingArticles={ articles } updateWardrobe={ {update: updateWardrobe.update} }/> }/>
					<Route exact path='/wardrobe/new' render={ props => <ArticleForm { ...props } existingArticles={ articles } updateWardrobe={ {add: updateWardrobe.add} }/> } />
				</Switch>
				
			</main>
		)
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(Wardrobe));