import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import callAPI from './Modules/call-api';
import Header from './Components/Header.jsx';
import Home from './Pages/Home.jsx';
import Wardrobe from './Pages/Wardrobe.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import Logout from './Pages/Logout.jsx';
import NotFound from './Pages/404.jsx';
import './App.css';

export default class App extends Component {
	constructor() {
		super();
		this.state = {
			user: {},
			isAuthenticated: false,
			articles: []
		}
	}

	componentWillMount() {
		const user = JSON.parse(localStorage.getItem('user'));
		const lastRefresh = Number(localStorage.getItem('lastRefresh'));
		if (user && Date.now() - lastRefresh < 1000 * 60 * 60 * 24 * 14) {// must log back in after 2 weeks of inactivity
			this.logUserIn(user, user.token)
		} else if (user) {
			localStorage.setItem('user', null);
			localStorage.setItem('lastRefresh', null);
		}
	}

	logUserIn = async (user, token) => {
		await this.setState({
			user: {...user, token: token},
			isAuthenticated: true
		});
		localStorage.setItem('user', JSON.stringify({...user, token}));
		localStorage.setItem('lastRefresh', Date.now().toString());
		this.fetchArticles();
	}

	logUserOut = () => {
		this.setState({ isAuthenticated: false, user: {}});
		localStorage.setItem('user', null);
		localStorage.setItem('lastRefresh', null);
	}

	fetchArticles = async () => {
		const { user, isAuthenticated } = this.state;
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

	addArticle = (article) => {
		const { articles } = this.state;
		articles.push(article);
		this.setState({ articles });
	}

	updateArticle = (article) => {
		this.removeArticle(article);
		this.addArticle(article);
	}

	removeArticle = (article) => {
		const { articles } = this.state;
		this.setState({
			articles: articles.filter(a => a._id != article._id)
		})
	}

	render() {
		const { user, isAuthenticated, articles } = this.state;

		const updateWardrobe = {
			add: this.addArticle,
			update: this.updateArticle,
			remove: this.removeArticle
		}

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
				<Route exact path='/' render={ props => <Home { ...props } user={ user }/> }/>
				<Route path='/wardrobe' render={ props => <Wardrobe { ...props } articles={ articles } updateWardrobe={ updateWardrobe } user={ user }/> }/>
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