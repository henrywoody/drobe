import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import ArticlesIndex from '../../Pages/ArticlesIndex';
import ArticleDetail from '../../Pages/ArticleDetail';
import ArticleEdit from '../../Pages/ArticleEdit';
import ArticleNew from '../../Pages/ArticleNew';

class Wardrobe extends Component {
	render() {
		return (
			<Switch>
				<Route exact path='/wardrobe' component={ ArticlesIndex }/>
				<Route exact path={ `/wardrobe/:pluralArticleKind/:articleId` } component={ ArticleDetail }/>
				<Route exact path={ `/wardrobe/:pluralArticleKind/:articleId/edit` } component={ ArticleEdit }/>
				<Route exact path='/wardrobe/new' component={ ArticleNew } />
			</Switch>
		)
	}
}

export default withRouter(Wardrobe);