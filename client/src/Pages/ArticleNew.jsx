import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ArticleForm from '../Forms/ArticleForm.jsx';

class ArticleNew extends Component {
	render() {
		return (
			<main>
				<h1>New Article</h1>

				<ArticleForm/>
			</main>
		)
	}
}

export default withRouter(ArticleNew);