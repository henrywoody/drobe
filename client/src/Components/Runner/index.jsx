import React, { Component } from 'react';
import CanvasComponent from './CanvasComponent.jsx';

export default class Runner extends Component {
	constructor(props) {
		super(props);
		this.state = {
			runnerPosition: 0,
			isRunning: false,
			runEvery: 250,
			runSpeed: props.runSpeed || 3,
			waitCounter: 0,
			fadeCounter: 0,
			fadeFrequency: 20
		}
		this.requestId = null;
	}

	componentDidMount() {
		this.requestAnimationFrame()(this.update);
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

	update = () => {
		const { width } = this.props;
		const { runnerPosition, isRunning, runEvery, runSpeed, waitCounter, fadeCounter, fadeFrequency } = this.state;

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

		this.requestId = this.requestAnimationFrame()(this.update);
	}

	render() {
		const { width, height, inverted } = this.props;
		const { isRunning, runSpeed, runnerPosition, fadeCounter } = this.state;

		return <CanvasComponent
					width={ width }
					height={ height }
					runnerPosition={ runnerPosition }
					runnerWidth={ runSpeed }
					displayRunner={ isRunning }
					applyFade={ fadeCounter === 0 }
					inverted={ inverted }
				/>
	}
}