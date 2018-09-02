import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import HeaderNav from './HeaderNav';
import Runner from '../Runner';
import './style.css';

export default class Header extends Component {
	constructor() {
		super();
		this.state = {
			hideDrawer: true,
			runnerWidth: window.innerWidth
		}
	}

	componentDidMount() {
		window.addEventListener('resize', this.updateRunnerWidth);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateRunnerWidth);
	}

	updateRunnerWidth = () => {
		this.setState({runnerWidth: window.innerWidth});
	}

	render() {
		const { hideDrawer } = this.state;

		return (
			<header>
				<div className='bar'>
					<div className='title-container'>
						<NavLink to='/' className='title' onClick={ () => this.setState({hideDrawer: true})}>Dr obe</NavLink>
					</div>
					<HeaderNav hideDrawer={ hideDrawer } handleDrawerClick={ () => this.setState({hideDrawer: true}) }/>
					<button className='button-toggle-nav-drawer btn-secondary' onClick={ () => this.setState({hideDrawer: !hideDrawer}) }>{ hideDrawer ? '+' : '-' }</button>
					<Runner width={ window.innerWidth } height={ 2 }/>
				</div>

				<div className={ 'gray-screen' + (hideDrawer ? ' hidden' : '') } onClick={ () => this.setState({hideDrawer: !hideDrawer})}></div>
			</header>
		)
	}
}