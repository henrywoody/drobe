import React, { Component } from 'react';

export default class CanvasComponent extends Component {
	constructor() {
		super();
		this.drobeBlue = '#1bb8d1';
	}

	componentDidUpdate(prevProps) {
		this.update();
	}

	update() {
		const { circle1Progress, circle2Progress, size, inverted } = this.props;
		const ctx = this.refs.canvas.getContext('2d');

		ctx.clearRect(0,0, size, size);
		ctx.globalAlpha = 1;
		ctx.fillStyle = inverted ? this.drobeBlue : '#ffffff';
		ctx.fillRect(0,0, size, size);

		ctx.strokeStyle = inverted ? '#ffffff' : this.drobeBlue;
		ctx.lineWidth = 1.5;

		for (const progress of [circle1Progress, circle2Progress]) {
			ctx.globalAlpha = 1 - progress;
			ctx.beginPath();
			ctx.arc(size/2, size/2, size/2 * progress, 0, 2*Math.PI)
			ctx.stroke();
			ctx.closePath();
		}

		ctx.restore();
	}

	render() {
		const { size } = this.props;

		return (
			<div className='loader'>
				<canvas ref='canvas' width={ size } height={ size }/>
			</div>
		)
	}
}