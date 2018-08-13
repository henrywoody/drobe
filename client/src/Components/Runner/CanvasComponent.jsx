import React, { Component } from 'react';

export default class CanvasComponent extends Component {
	constructor() {
		super();
		this.state = {
			drobeBlue: '#1bb8d1'
		}
	}

	componentDidMount() {
		const { width, height } = this.props;
		const { drobeBlue } = this.state;
		const ctx = this.refs.canvas.getContext('2d');
		ctx.fillStyle = drobeBlue;
		ctx.fillRect(0,0, width,height);
	}

	componentDidUpdate() {
		this.update();
	}

	update() {
		const { width, height, runnerPosition, runnerWidth, displayRunner, applyFade } = this.props;
		const { drobeBlue } = this.state;

		const ctx = this.refs.canvas.getContext('2d');
		if (applyFade) {
			ctx.globalAlpha = 0.02;
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0,0, width,height);
		}

		if (displayRunner) {
			ctx.globalAlpha = 1;
			ctx.fillStyle = drobeBlue;
			ctx.fillRect(width/2 - runnerPosition,0, runnerWidth,height);
			ctx.fillRect(width/2 + runnerPosition,0, runnerWidth,height);
		}

		ctx.filter = 'blur(1px);saturation(200%)'
		ctx.restore();
	}

	render() {
		const { width, height } = this.props;

		return <canvas ref='canvas' width={ width } height={ height }/>
	}
}