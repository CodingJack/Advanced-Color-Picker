import React from 'react';

import {
	AppContext,
} from '../../../../context';

import {
	hsbaData,
} from '../../../../utils/hsl';

const {
	Component,
	createRef,
} = React;

const rainbow = [
	{ stop: 0, color: '#ff0000' },
	{ stop: 0.0049, color: '#ff0000' },
	{ stop: 0.15, color: '#ffff00' },
	{ stop: 0.1549, color: '#ffff00' },
	{ stop: 0.33, color: '#00ff00' },
	{ stop: 0.3349, color: '#00ff00' },
	{ stop: 0.49, color: '#00ffff' },
	{ stop: 0.4949, color: '#00ffff' },
	{ stop: 0.67, color: '#0000ff' },
	{ stop: 0.6749, color: '#0000ff' },
	{ stop: 0.84, color: '#ff00ff' },
	{ stop: 0.8449, color: '#ff00ff' },
	{ stop: 1, color: '#ff0000' },
];

const fadeToBlack = [
	{ stop: 0.01, color: 'transparent' },
	{ stop: 0.99, color: '#000' },
	{ stop: 1, color: '#000' },
];

const addGradient = ( grad, colors ) => {
	colors.forEach( clr => {
		const { stop, color } = clr;
		grad.addColorStop( stop, color );
	} );
}

const drawRainbow = ( ctx, alpha ) => {
	const { canvas: ctxCanvas } = ctx;
	const { width, height } = ctxCanvas;
	ctx.clearRect( 0, 0, width, height );

	const gradRainbow = ctx.createLinearGradient( 0, 0, width, 0 );
	addGradient( gradRainbow, rainbow );
	ctx.fillStyle = gradRainbow;
	ctx.fillRect( 0, 0, width, height );

	if( alpha === undefined ) {
		return;
	}

	ctx.fillStyle = `rgba( 255, 255, 255, ${ alpha } )`;
	ctx.fillRect( 0, 0, width, height );

	const gradBlack = ctx.createLinearGradient( 0, 0, 0, height );
	addGradient( gradBlack, fadeToBlack );
	ctx.fillStyle = gradBlack;
	ctx.fillRect( 0, 0, width, height );
}

const drawStrip = ( strip, color, alpha ) => {
	const grayscale = Math.round( 255 - ( alpha * 255 ) );
	const fadeColor = `rgb(${ grayscale }, ${ grayscale }, ${ grayscale })`;
	const rgbColor = `rgb(${ color[0] }, ${ color[1] }, ${ color[2] })`;
	strip.style.background = `linear-gradient(${ rgbColor }, ${ fadeColor })`;
};

class ColorPalette extends Component {
	constructor() {
		super( ...arguments );

		this.baseRef = createRef();
		this.canvasRef = createRef();
		this.pointerRef = createRef();
		this.containerRef = createRef();
		this.colorStripRef = createRef();
		this.colorStripHandleRef = createRef();
	}

	componentDidMount() {
		this.getGridRect();
		const { width, height } = this.containerRect;

		this.gridWidth = width - 1;
		this.gridHeight = height - 1;

		const { current: base } = this.baseRef;
		const { current: canvas } = this.canvasRef;

		this.baseCtx = base.getContext( '2d' );
		this.ctx = canvas.getContext( '2d' );

		drawRainbow( this.baseCtx );
		window.requestAnimationFrame( this.onUpdate );
	}

	componentDidUpdate() {
		const { updatePalette } = this.props;

		if( updatePalette ) {
			window.cancelAnimationFrame( this.onUpdate );
			window.requestAnimationFrame( this.onUpdate );
		}
	}

	movePointer( pointX, pointY ) {
		const {
			width,
			height,
		} = this.props;

		let x = ( ( pointX * 100 ) * 0.01 ) * width;
		const y = ( ( 100 - pointY ) * 0.01 ) * height;

		this.points = { x, y };
		const { current: point } = this.pointerRef;

		point.style.left = `${ x }px`;
		point.style.top = `${ y }px`;
	}

	onUpdate = () => {
		if ( this.draggingStrip ) {
			return;
		}

		const { color } = this.props;
		const { h, b, alpha } = hsbaData( color );

		if ( this.draggingPointer ) {
			this.updateStrip( alpha );
			return;
		}

		drawRainbow( this.ctx, alpha );

		this.movePointer( h / 360, b );
		this.moveStrip( alpha );
		this.updateStrip( alpha );
	}

	moveStrip( alpha ) {
		const {
			current: colorStripHandleRef,
		} = this.colorStripHandleRef;

		colorStripHandleRef.style.top = `${ alpha * 100 }%`;
	}

	updateStrip = opacity => {
		const { current } = this.colorStripRef;
		const { x, y } = this.points;

		const imgData = this.baseCtx.getImageData(
			Math.min( x, this.gridWidth ), Math.min( y, this.gridHeight ), 1, 1
		);
		
		this.alpha = opacity;
		const { data } = imgData;
		drawStrip( current, data.slice( 0, 3 ), opacity );
	}

	getGridRect() {
		const { current: container } = this.containerRef;
		const containerRect = container.getBoundingClientRect();
		this.containerRect = containerRect;
	}

	onMouseDownGrid = e => {
		e.preventDefault();
		this.getGridRect();
		this.draggingPointer = true;
		
		const { setCursor } = this.context;
		setCursor( 'move' );
		this.onMouseMoveGrid( e );

		document.addEventListener( 'mousemove', this.onMouseMoveGrid );
		document.addEventListener( 'mouseleave', this.onMouseUpGrid );
		document.addEventListener( 'mouseup', this.onMouseUpGrid );
	}

	onMouseDownStrip = e => {
		e.preventDefault();
		const { current: colorStrip } = this.colorStripRef;
		const stripRect = colorStrip.getBoundingClientRect();
		const { setCursor } = this.context;

		setCursor( 'vertical' );
		this.stripRect = stripRect;
		this.draggingStrip = true;
		this.onMouseMoveStrip( e );

		document.addEventListener( 'mousemove', this.onMouseMoveStrip );
		document.addEventListener( 'mouseleave', this.onMouseUpStrip );
		document.addEventListener( 'mouseup', this.onMouseUpStrip );
	}

	onChangeGrid = () => {
		const { current: point } = this.pointerRef;
		const { width, height, left, top } = this.containerRect;

		const x = Math.max( 0, Math.min( this.pageX - left, width ) );
		const y = Math.max( 0, Math.min( this.pageY - top, height ) );

		this.points = { x, y };
		point.style.left = `${ x }px`;
		point.style.top = `${ y }px`;

		const imgData = this.ctx.getImageData(
			Math.min( x, width - 1 ), Math.min( y, height - 1 ), 1, 1
		);

		const { data } = imgData;
		const { onChange } = this.props;
		
		this.updateStrip( this.alpha );
		onChange( Array.from( data ).slice( 0, 3 ), 'color', true );
	}

	onChangeStrip = () => {
		const { x, y } = this.points;
		const { current: colorStripHandle } = this.colorStripHandleRef;
		const { height, top } = this.stripRect;

		const perc = Math.max( 0,
			Math.min(
				this.pageY - window.scrollY - top,
				height
			)
		);

		const alpha = perc / height;
		colorStripHandle.style.top = `${ alpha * 100 }%`;

		drawRainbow( this.ctx, alpha );
		this.updateStrip( alpha );

		const imgData = this.ctx.getImageData(
			Math.min( x, this.gridWidth ), Math.min( y, this.gridHeight ), 1, 1
		);

		const { data } = imgData;
		const { onChange } = this.props;
		onChange( Array.from( data ).slice( 0, 3 ), 'color', true );
	}

	onMouseMoveGrid = e => {
		const { pageX, pageY } = e;
		this.pageX = pageX;
		this.pageY = pageY;

		window.cancelAnimationFrame( this.onChangeGrid );
		window.requestAnimationFrame( this.onChangeGrid );
	}

	onMouseMoveStrip = e => {
		const { pageY } = e;
		this.pageY = pageY;

		window.cancelAnimationFrame( this.onChangeStrip );
		window.requestAnimationFrame( this.onChangeStrip );
	}

	removeGridListeners() {
		document.removeEventListener( 'mousemove', this.onMouseMoveGrid );
		document.removeEventListener( 'mouseleave', this.onMouseUpGrid );
		document.removeEventListener( 'mouseup', this.onMouseUpGrid );
	}

	removeStripListeners() {
		document.removeEventListener( 'mousemove', this.onMouseMoveStrip);
		document.removeEventListener( 'mouseleave', this.onMouseUpStrip );
		document.removeEventListener( 'mouseup', this.onMouseUpStrip );
	}

	onMouseUpGrid = () => {
		this.removeGridListeners();
		this.draggingPointer = false;
		const { setCursor } = this.context;
		setCursor();
	}

	onMouseUpStrip = () => {
		this.removeStripListeners();
		this.draggingStrip = false;
		const { setCursor } = this.context;
		setCursor();
	}

	componentWillUnmount() {
		window.cancelAnimationFrame( this.onUpdate );
		window.cancelAnimationFrame( this.onChangeGrid );
		window.cancelAnimationFrame( this.onChangeStrip );

		this.removeGridListeners();
		this.removeStripListeners();
		this.ctx = null;
		this.baseCtx = null;
		this.points = null;
		this.baseRef = null;
		this.stripRect = null;
		this.canvasRef = null;
		this.pointerRef = null;
		this.containerRef = null;
		this.containerRect = null;
		this.colorStripRef = null;
		this.colorStripHandleRef = null;
	}

	render() {
		const {
			width,
			height,
		} = this.props;

		const { namespace } = this.context;

		return (
			<div className={ `${ namespace }-palette-wrap` }>
				<div
					className={ `${ namespace }-palette-container` }
					onMouseDown={ this.onMouseDownGrid }
					ref={ this.containerRef }
				>
					<canvas
						className={ `${ namespace }-base-palette` }
						width={ width }
						height={ height }
						ref={ this.baseRef }
					></canvas>
					<canvas
						className={ `${ namespace }-palette` }
						width={ width }
						height={ height }
						ref={ this.canvasRef }
					></canvas>
					<span
						className={ `${ namespace }-palette-point` }
						ref={ this.pointerRef }
					></span>
				</div>
				<div
					className={ `${ namespace }-strip-wrap` }
					onMouseDown={ this.onMouseDownStrip }
				>
					<div
						className={ `${ namespace }-strip` }
						ref={ this.colorStripRef }
					>
						<span
							className={ `${ namespace }-strip-handle` }
							ref={ this.colorStripHandleRef }
						></span>
					</div>
				</div>
			</div>
		);
	}
}

ColorPalette.contextType = AppContext;

export default ColorPalette;
