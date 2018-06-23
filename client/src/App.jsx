import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Header from './Components/Header.jsx';
import Home from './Pages/Home.jsx';
import Wardrobe from './Pages/Wardrobe.jsx';
import './App.css';

export default class App extends Component {
	constructor() {
		super();
		this.state = {
			user: {
				_id: "5b269bbc16b19be6a4203974",
				username: "test",
				token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YjI2OWJiYzE2YjE5YmU2YTQyMDM5NzQiLCJpYXQiOjE1MjkyNTY4OTJ9.Y4OZW6nH8L_6CRFSdhltzrpFkshPyRoWIjfbaovUIBI",
				location: {
					latitude: '34.4',
					longitude: '-118.5',
					name: 'Los Angeles, CA, USA'
				}
			}
		}
	}

	render() {
		const { user } = this.state;

		return (
			<div className="App">
				<Header links={ [
						{name: 'Home', exact: true, href: '/'},
						{name: 'Wardrobe', exact: false, href: '/wardrobe'}
				] }/>

				<Switch>
					<Route exact path='/' render={ props => <Home { ...props } user={ user }/> }/>
					<Route path='/wardrobe' render={ props => <Wardrobe { ...props } user={ user }/> }/>
				</Switch>
			</div>
		);
	}
}