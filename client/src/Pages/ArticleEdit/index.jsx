import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ArticleForm from '../../Forms/ArticleForm';

class ArticleEdit extends Component {
	render() {
		return (
			<main>
				<h1>Edit</h1>

				<ArticleForm/>
			</main>
		)
	}
}

export default withRouter(ArticleEdit);