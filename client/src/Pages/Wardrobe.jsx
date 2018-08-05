import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ArticlesIndex from '../Components/ArticlesIndex.jsx';
import DetailedArticle from '../Components/DetailedArticle.jsx'
import ArticleForm from '../Forms/ArticleForm.jsx';

class Wardrobe extends Component {
	render() {
		const { user, articles } = this.props;

		return (
			<main>
				<h1>Wardrobe</h1>

				<Switch>
					<Route exact path='/wardrobe' render={ props => <ArticlesIndex { ...props }/> }/>
					<Route exact path={ `/wardrobe/:pluralArticleKind/:articleId` } render={ props => <DetailedArticle { ...props }/> }/>
					<Route exact path={ `/wardrobe/:pluralArticleKind/:articleId/edit` } render={ props => <ArticleForm { ...props }/> }/>
					<Route exact path='/wardrobe/new' render={ props => <ArticleForm { ...props }/> } />
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