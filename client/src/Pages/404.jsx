import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class NotFound extends Component {
	render() {
		return (
			<main>
				<h1>404</h1>

				<p>
					Page not found.
				</p>
			</main>
		)
	}
}

export default withRouter(NotFound);