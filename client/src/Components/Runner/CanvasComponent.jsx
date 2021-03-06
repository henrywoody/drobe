import React, { Component } from 'react';

export default class CanvasComponent extends Component {
	constructor() {
		super();
		this.drobeBlue = '#1bb8d1'
	}

	componentDidMount() {
		this.setupCanvas();
	}

	componentDidUpdate(prevProps) {
		this.update();
		if (prevProps.width !== this.props.width) {
			this.setupCanvas();
		}
	}

	setupCanvas() {
		const { width, height, inverted } = this.props;
		const ctx = this.refs.canvas.getContext('2d');
		ctx.fillStyle = inverted ? '#ffffff' : this.drobeBlue;
		ctx.fillRect(0,0, width,height);
	}

	update() {
		const { width, height, runnerPosition, runnerWidth, displayRunner, applyFade, inverted } = this.props;

		const ctx = this.refs.canvas.getContext('2d');
		if (applyFade) {
			ctx.globalAlpha = 0.02;
			ctx.fillStyle = inverted ? this.drobeBlue : '#ffffff';
			ctx.fillRect(0,0, width,height);
		}

		if (displayRunner) {
			ctx.globalAlpha = 1;
			ctx.fillStyle = inverted ? '#ffffff' : this.drobeBlue;
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