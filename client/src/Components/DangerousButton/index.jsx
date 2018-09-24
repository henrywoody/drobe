import React, { Component } from 'react';
import './style.css';

export default class DangerousButton extends Component {
	constructor() {
		super();
		this.state = {
			wasClicked: false
		};
	}

	render() {
		const { children, onClick } = this.props;
		const { wasClicked } = this.state;

		if (!wasClicked) {
			return (
				<button className='btn-danger' onClick={ () => this.setState({wasClicked: true}) }>{ children }</button>
			)
		}
		return (
			<div className='verify-buttons-container'>
				<span className='confirmation-message'>Really?</span>
				<button className='btn-danger' onClick={ onClick }>{ children }</button>
				<button className='btn-secondary' onClick={ () => this.setState({wasClicked: false}) }>Cancel</button>
			</div>
		)
	}
}