import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import ArticlesIndex from '../Components/ArticlesIndex.jsx';
import DetailedArticle from '../Components/DetailedArticle.jsx'
import ArticleForm from '../Forms/ArticleForm.jsx';

export default class Wardrobe extends Component {
	render() {
		const { user, articles, updateWardrobe } = this.props;

		return (
			<main>
				<h1>Wardrobe</h1>

				<Switch>
					<Route exact path='/wardrobe' render={ props => <ArticlesIndex { ...props } articles={ articles } user={ user }/> }/>
					<Route exact path={ `/wardrobe/:articleKind/:articleId` } render={ props => <DetailedArticle { ...props } existingArticles={ articles } updateWardrobe={ {remove: updateWardrobe.remove} } user={ user }/> }/>
					<Route exact path={ `/wardrobe/:articleKind/:articleId/edit` } render={ props => <ArticleForm { ...props } existingArticles={ articles } updateWardrobe={ {update: updateWardrobe.update} } user={ user }/> }/>
					<Route exact path='/wardrobe/new' render={ props => <ArticleForm { ...props } existingArticles={ articles } updateWardrobe={ {add: updateWardrobe.add} } user={ user }/> } />
				</Switch>
				
			</main>
		)
	}
}