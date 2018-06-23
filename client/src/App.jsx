import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import callAPI from './Modules/call-api';
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
			},
			articles: []
		}
	}

	componentWillMount() {
		this.fetchArticles();
	}

	fetchArticles = async () => {
		const { user } = this.state;

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
		const { user, articles } = this.state;

		const updateWardrobe = {
			add: this.addArticle,
			update: this.updateArticle,
			remove: this.removeArticle
		}

		return (
			<div className="App">
				<Header links={ [
						{name: 'Home', exact: true, href: '/'},
						{name: 'Wardrobe', exact: false, href: '/wardrobe'}
				] }/>

				<Switch>
					<Route exact path='/' render={ props => <Home { ...props } user={ user }/> }/>
					<Route path='/wardrobe' render={ props => <Wardrobe { ...props } articles={ articles } updateWardrobe={ updateWardrobe } user={ user }/> }/>
				</Switch>
			</div>
		);
	}
}