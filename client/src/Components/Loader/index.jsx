import React, { Component } from 'react';
import CanvasComponent from './CanvasComponent.jsx';
import './style.css';

export default class Loader extends Component {
	constructor() {
		super();
		this.state = {
			circle1Progress: 0,
			circle2Progress: 0.5,
		}
		this.progressSpeed = 0.01;
		this.requestId = null;
	}

	componentDidMount() {
		this.requestId = this.requestAnimationFrame()(this.update);
	}

	componentWillUnmount() {
		this.cancelAnimationFrame();
	}

	requestAnimationFrame() {
		return window.requestAnimationFrame		||
			window.webkitRequestAnimationFrame	||
			window.mozRequestAnimationFrame		||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	}

	cancelAnimationFrame() {
		window.cancelAnimationFrame(this.requestId);
	}

	incrementProgress(x) {
		return (x + this.progressSpeed) % 1;
	}

	update = () => {
		const { circle1Progress, circle2Progress } = this.state;

		this.setState({
			circle1Progress: this.incrementProgress(circle1Progress),
			circle2Progress: this.incrementProgress(circle2Progress)
		});
		this.requestId = this.requestAnimationFrame()(this.update);
	}

	render() {
		const { circle1Progress, circle2Progress } = this.state;

		return <CanvasComponent
					circle1Progress={ circle1Progress }
					circle2Progress={ circle2Progress }
					size={ 200 }
				/>
	}
}