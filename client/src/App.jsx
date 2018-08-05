import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import callAPI from './Modules/call-api';
import updateUser from './Modules/update-user';
import Header from './Components/Header.jsx';
import Home from './Pages/Home.jsx';
import Wardrobe from './Pages/Wardrobe.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import Logout from './Pages/Logout.jsx';
import NotFound from './Pages/404.jsx';
import { connect } from 'react-redux';
import { logUserIn, logUserOut } from './redux-actions';
import './App.css';

class App extends Component {
	constructor() {
		super();
		this.state = {
			articles: []
		}
	}

	componentWillMount() {
		const user = JSON.parse(localStorage.getItem('user'));
		const lastRefresh = Number(localStorage.getItem('lastRefresh'));

		if (user && Date.now() - lastRefresh < 1000 * 60 * 60 * 24 * 14) {// must log back in after 2 weeks of inactivity
			this.logUserIn(user, user.token)
		} else if (user) {
			this.clearUserInfo();
		}
	}

	logUserIn = async (user, token) => {
		const { logUserIn } = this.props;

		await logUserIn({...user, token});
		this.storeUserInfo({...user, token});
		this.fetchArticles();
	}

	storeUserInfo(user) {
		localStorage.setItem('user', JSON.stringify(user));
		localStorage.setItem('lastRefresh', Date.now().toString());
	}

	clearUserInfo() {
		localStorage.setItem('user', null);
		localStorage.setItem('lastRefresh', null);
	}

	updateUser = async (user) => {
		const { logUserIn } = this.props;

		const updatedUser = await updateUser(user.id, user.token, { user });
		this.storeUserInfo({...updatedUser, token: user.token});
		logUserIn({...updatedUser, token: user.token});
	}

	logUserOut = () => {
		const { logUserOut } = this.props;
		logUserOut();
		this.clearUserInfo();
	}

	fetchArticles = async () => {
		const { user, isAuthenticated } = this.props;
		if (!isAuthenticated)
			return;

		// fetch articles for user
		const [
			shirts,
			pants,
			outerwears
		] = await Promise.all([
			callAPI('shirts', null, user.token),
			callAPI('pants', null, user.token),
			callAPI('outerwears', null, user.token)
		]);

		const articles = [
			...shirts,
			...pants,
			...outerwears
		];

		this.setState({ articles });
	}

	render() {
		const { user, isAuthenticated } = this.props;
		const { articles } = this.state;

		const links = isAuthenticated ? (
			[
				{name: 'Home', exact: true, href: '/'},
				{name: 'Wardrobe', exact: false, href: '/wardrobe'},
				{name: 'Logout', exact: true, href: '/logout'}
			]
		) : (
			[
				{name: 'Login', exact: true, href: '/'},
				{name: 'Register', exact: true, href: '/register'}
			]
		);

		const content = isAuthenticated ? (
			<Switch>
				<Route exact path='/' render={ props => <Home { ...props } userHasClothes={ !!articles.length } updateUser={ this.updateUser }/> }/>
				<Route path='/wardrobe' render={ props => <Wardrobe { ...props } articles={ articles }/> }/>
				<Route exact path='/logout' render={ props => <Logout { ...props} logUserOut={ this.logUserOut }/> }/>
				<Route component={ NotFound }/>
			</Switch>
		) : (
			<Switch>
				<Route exact path='/register' render={ props => <Register { ...props } logUserIn={ this.logUserIn }/> }/>
				<Route exact path='/logout' render={ props => <Logout { ...props} logUserOut={ this.logUserOut }/> }/>
				<Route path='/' render={ props => <Login { ...props } logUserIn={ this.logUserIn }/> }/>
			</Switch>
		);

		return (
			<div className="App">
				<Header links={ links }/>

				{ content }
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.user,
		isAuthenticated: state.isAuthenticated
	}
}

const mapDispatchToProps = {
	logUserIn,
	logUserOut
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));