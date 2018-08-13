import React, { Component } from 'react';
import CanvasComponent from './CanvasComponent.jsx';

export default class Runner extends Component {
	constructor(props) {
		super(props);
		const { width } = this.props;
		this.state = {
			runnerPosition: 0,
			isRunning: false,
			runEvery: 250,
			waitCounter: 0,
			runSpeed: 3,
			fadeCounter: 0,
			fadeFrequency: 20
		}
	}

	componentDidMount() {
		this.requestAnimationFrame()(this.update);
	}

	requestAnimationFrame() {
		return window.requestAnimationFrame		||
			window.webkitRequestAnimationFrame	||
			window.mozRequestAnimationFrame		||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
	}

	update = () => {
		const { width } = this.props;
		const { runnerPosition, isRunning, runEvery, waitCounter, runSpeed, fadeCounter, fadeFrequency } = this.state;

		if (isRunning) {
			this.setState({
				runnerPosition: runnerPosition + runSpeed,
			});

			if (runnerPosition >= width) {
				this.setState({
					isRunning: false,
					runnerPosition: 0
				});
			}
		} else {
			this.setState({
				waitCounter: waitCounter + 1
			})
		}

		if (waitCounter === runEvery) {
			this.setState({
				isRunning: true,
				waitCounter: 0
			});
		}

		this.setState({
			fadeCounter: (fadeCounter + 1) % fadeFrequency
		})

		this.requestAnimationFrame()(this.update);
	}

	render() {
		const { width, height } = this.props;
		const { isRunning, runnerPosition, runSpeed, fadeCounter } = this.state;

		return <CanvasComponent width={ width } height={ height } runnerPosition={ runnerPosition } runnerWidth={ runSpeed } displayRunner={ isRunning } applyFade={ fadeCounter === 0 }/>
	}
}