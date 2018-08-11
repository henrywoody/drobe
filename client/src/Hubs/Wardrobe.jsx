import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ArticlesIndex from '../Pages/ArticlesIndex.jsx';
import ArticleDetail from '../Pages/ArticleDetail.jsx';
import ArticleEdit from '../Pages/ArticleEdit.jsx';
import ArticleNew from '../Pages/ArticleNew.jsx';

class Wardrobe extends Component {
	render() {
		const { user, articles } = this.props;

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

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(Wardrobe));