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

/*
 * @desc colors for the palette rainbow, with precalculated stops to ensure 
 *       that the core colors (red, blue, etc.) exist as individual pixels once blended as a gradient
 * @since 1.0.0
*/
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

/*
 * @desc base colors for the saturation strip
 * @since 1.0.0
*/
const fadeToBlack = [
	{ stop: 0.01, color: 'transparent' },
	{ stop: 0.99, color: '#000' },
	{ stop: 1, color: '#000' },
];

/*
 * @desc draws appropriate colors onto the canvas gradient
 * @since 1.0.0
*/
const addGradient = ( grad, colors ) => {
	colors.forEach( clr => {
		const { stop, color } = clr;
		grad.addColorStop( stop, color );
	} );
}

/*
 * @desc draws the two main gradients used for the color palette 
 * @since 1.0.0
*/
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

/*
 * @desc draws the saturation strip
 * @since 1.0.0
*/
const drawStrip = ( strip, color, alpha ) => {
	const grayscale = Math.round( 255 - ( alpha * 255 ) );
	const fadeColor = `rgb(${ grayscale }, ${ grayscale }, ${ grayscale })`;
	const rgbColor = `rgb(${ color[0] }, ${ color[1] }, ${ color[2] })`;
	strip.style.background = `linear-gradient(${ rgbColor }, ${ fadeColor })`;
};

/*
 * @desc this class manages the color palette and the saturation strip
 * @since 1.0.0
*/
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
	
	/*
	 * @desc draws the color palette and saturation strip on first mount
	 * @since 1.0.0
	*/
	componentDidMount() {
		this.getPaletteRect();
		const { width, height } = this.paletteRect;

		this.paletteWidth = width - 1;
		this.paletteHeight = height - 1;

		const { current: base } = this.baseRef;
		const { current: canvas } = this.canvasRef;

		this.baseCtx = base.getContext( '2d' );
		this.ctx = canvas.getContext( '2d' );

		drawRainbow( this.baseCtx );
		window.requestAnimationFrame( this.onUpdate );
	}
	
	/*
	 * @desc updates the palette and strip if the color changed from outside this class
	 *       this helps to avoid expensive canvas drawing whenever possible
	 * @since 1.0.0
	*/
	componentDidUpdate() {
		const { updatePalette } = this.props;

		if( updatePalette ) {
			window.cancelAnimationFrame( this.onUpdate );
			window.requestAnimationFrame( this.onUpdate );
		}
	}
	
	/*
	 * @desc manually positions the pointer if the color was changed from outside this class
	 * @param number pointX - where the pointer should be placed horizontally in the palette
	 * @param number pointY - where the pointer should be placed vertically in the palette
	 * @since 1.0.0
	*/
	positionPointer( pointX, pointY ) {
		const {
			width,
			height,
		} = this.props;

		const x = ( ( pointX * 100 ) * 0.01 ) * width;
		const y = ( ( 100 - pointY ) * 0.01 ) * height;

		this.points = { x, y };
		const { current: point } = this.pointerRef;

		point.style.left = `${ x }px`;
		point.style.top = `${ y }px`;
	}
	
	/*
	 * @desc redraws the canvases when the color has changed from outside this class
	 * @since 1.0.0
	*/
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

		this.positionPointer( h / 360, b );
		this.positionStrip( alpha );
		this.updateStrip( alpha );
	}
	
	/*
	 * @desc manually positions the strip handle when the color has changed from outside this class
	 * @param number alpha - the color's brightness level
	 * @since 1.0.0
	*/
	positionStrip( alpha ) {
		const {
			current: colorStripHandleRef,
		} = this.colorStripHandleRef;

		colorStripHandleRef.style.top = `${ alpha * 100 }%`;
	}
	
	/*
	 * @desc redraws the strip canvas whenever needed (from internal color palette change or external global change)
	 * @param number alpha - the color's brightness level
	 * @since 1.0.0
	*/
	updateStrip = alpha => {
		const { current } = this.colorStripRef;
		const { x, y } = this.points;

		const imgData = this.baseCtx.getImageData(
			Math.min( x, this.paletteWidth ), Math.min( y, this.paletteHeight ), 1, 1
		);
		
		this.alpha = alpha;
		const { data } = imgData;
		drawStrip( current, data.slice( 0, 3 ), alpha );
	}
	
	/*
	 * @desc caches the dimensions of the palette used for getting the image data from the canvas
	 * @since 1.0.0
	*/
	getPaletteRect() {
		const { current: container } = this.containerRef;
		const paletteRect = container.getBoundingClientRect();
		this.paletteRect = paletteRect;
	}
	
	/*
	 * @desc user has "moused down" on the palette with the intention of changing the color
	 * @since 1.0.0
	*/
	onMouseDownPalette = e => {
		e.preventDefault();
		this.getPaletteRect();
		this.draggingPointer = true;
		
		const { setCursor } = this.context;
		setCursor( 'move' );
		this.onMouseMovePalette( e );

		document.addEventListener( 'mousemove', this.onMouseMovePalette );
		document.addEventListener( 'mouseleave', this.onMouseUpPalette );
		document.addEventListener( 'mouseup', this.onMouseUpPalette );
	}
	
	/*
	 * @desc user has "moused down" on the strip with the intention of changing the saturation level
	 * @since 1.0.0
	*/
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
	
	/*
	 * @desc user is dragging the pointer across the palette,
	 *       image data is then captured from the palette canvas based on the pointer's position
	 * @since 1.0.0
	*/
	onChangePalette = () => {
		const { current: point } = this.pointerRef;
		const { width, height, left, top } = this.paletteRect;

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
	
	/*
	 * @desc user is dragging the handle in the strip, image data is then captured 
	 *       from the palette canvas as its saturation level has changed
	 * @since 1.0.0
	*/
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
			Math.min( x, this.paletteWidth ), Math.min( y, this.paletteHeight ), 1, 1
		);

		const { data } = imgData;
		const { onChange } = this.props;
		onChange( Array.from( data ).slice( 0, 3 ), 'color', true );
	}
	
	/*
	 * @desc user is dragging the pointer across the palette,
	 *       where new image data will be captured in the next paint
	 * @since 1.0.0
	*/
	onMouseMovePalette = e => {
		const { pageX, pageY } = e;
		this.pageX = pageX;
		this.pageY = pageY;

		window.cancelAnimationFrame( this.onChangePalette );
		window.requestAnimationFrame( this.onChangePalette );
	}
	
	/*
	 * @desc user is dragging the strip handle,
	 *       where new image data will be captured in the next paint
	 * @since 1.0.0
	*/
	onMouseMoveStrip = e => {
		const { pageY } = e;
		this.pageY = pageY;

		window.cancelAnimationFrame( this.onChangeStrip );
		window.requestAnimationFrame( this.onChangeStrip );
	}
	
	/*
	 * @desc cleanup after palette point dragging has ended
	 * @since 1.0.0
	*/
	removePaletteListeners() {
		document.removeEventListener( 'mousemove', this.onMouseMovePalette );
		document.removeEventListener( 'mouseleave', this.onMouseUpPalette );
		document.removeEventListener( 'mouseup', this.onMouseUpPalette );
	}
	
	/*
	 * @desc cleanup after strip handle dragging has ended
	 * @since 1.0.0
	*/
	removeStripListeners() {
		document.removeEventListener( 'mousemove', this.onMouseMoveStrip);
		document.removeEventListener( 'mouseleave', this.onMouseUpStrip );
		document.removeEventListener( 'mouseup', this.onMouseUpStrip );
	}
	
	/*
	 * @desc palette point dragging has ended
	 * @since 1.0.0
	*/
	onMouseUpPalette = () => {
		this.removePaletteListeners();
		this.draggingPointer = false;
		const { setCursor } = this.context;
		setCursor();
	}
	
	/*
	 * @desc strip handle dragging has ended
	 * @since 1.0.0
	*/
	onMouseUpStrip = () => {
		this.removeStripListeners();
		this.draggingStrip = false;
		const { setCursor } = this.context;
		setCursor();
	}
	
	/*
	 * @desc cleanup when the component unmounts
	 * @since 1.0.0
	*/
	componentWillUnmount() {
		window.cancelAnimationFrame( this.onUpdate );
		window.cancelAnimationFrame( this.onChangePalette );
		window.cancelAnimationFrame( this.onChangeStrip );

		this.removePaletteListeners();
		this.removeStripListeners();
		this.ctx = null;
		this.baseCtx = null;
		this.points = null;
		this.baseRef = null;
		this.stripRect = null;
		this.canvasRef = null;
		this.pointerRef = null;
		this.containerRef = null;
		this.paletteRect = null;
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
					onMouseDown={ this.onMouseDownPalette }
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
