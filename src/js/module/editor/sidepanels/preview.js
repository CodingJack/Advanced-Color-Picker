import React from 'react';
import Icon from '../../../components/icon';
import Grid from '../../../components/grid';
import Row from '../../../components/wrappers/row';
import CopyBtn from '../../../components/buttons/copy-btn';
import SaveBtn from '../../../components/buttons/save-btn';
import ButtonGroup from '../../../components/buttons/button-group';

import {
	EditorContext,
} from '../../../context';

import {
	withAppContext,
} from '../../../hoc/with-context';

import {
	getDirection,
} from '../../../utils/editor';

const {
	Component,
} = React;

// button items for when only a single gradient exists
const regularModeItems = {
	color: 'invert_colors',
	gradient: 'gradient',
};

// button items for when multiple gradients exist
const fullModeItems = {
	color: 'invert_colors',
	single_gradient: 'gradient',
	gradient: 'layers',
};

// direction values for the "angle/direction" grid displayed on mouse-over (for linear gradients)
const directions = [
	'left_top',
	'top',
	'right_top',
	'left',
	null,
	'right',
	'left_bottom',
	'bottom',
	'right_bottom',
];

/*
 * @desc the mini preview displayed toward the top right of the editor
 * @since 1.0.0
*/
class Preview extends Component {
	constructor() {
		super( ...arguments );
	}

	state = {
		hovered: false,
	}
	
	/*
	 * @desc resize arrow "moused down", prepare the preview for dragging/resizing
	 * @since 1.0.0
	*/
	onMouseDownResize = e => {
		e.preventDefault();
		const { pageX, pageY } = e;
		const pointRect = this.pointRef.getBoundingClientRect();
		const previewRect = this.previewRef.getBoundingClientRect();

		const {
			top: pointTop,
			left: pointLeft,
			width: pointWidth,
			height: pointHeight,
		} = pointRect;

		const {
			top: previewTop,
			left: previewLeft,
			width: previewWidth,
			height: previewHeight,
		} = previewRect;

		if ( ! this.previewWidth ) {
			this.previewWidth = previewWidth;
			this.previewHeight = previewHeight;
		}
		
		// the preview's size is stretched and then scaled via CSS order to display/represent possible pixel values (color stops, etc.)
		// because of this the "getBoundingClientRect()" is unreliable and the width/height need to be read manually
		if ( ! this.bgWidth ) {
			const bgStyle = window.getComputedStyle( this.bgRef );
			this.bgWidth = parseInt( bgStyle.getPropertyValue( 'width' ), 10 );
			this.bgHeight = parseInt( bgStyle.getPropertyValue( 'height' ), 10 );
		}

		this.mouseValues = {
			previewTop,
			previewLeft,
			pointWidth,
			pointHeight,
			moveX: Math.max( 0, Math.min( pageX - pointLeft, pointWidth ) ),
			moveY: Math.max( 0, Math.min( pageY - pointTop, pointHeight ) ),
		};
		
		const { appContext } = this.props;
		const { setCursor } = appContext;
		setCursor( 'diagonal' );

		document.addEventListener( 'mousemove', this.onMouseMoveResize );
		document.addEventListener( 'mouseleave', this.onMouseUp );
		document.addEventListener( 'mouseup', this.onMouseUp );
	}
	
	/*
	 * @desc user is dragging the resize arrow, resize the preview...
	 * @since 1.0.0
	*/
	onMouseMoveResize = e => {
		const { pageX, pageY } = e;
		const {
			moveX,
			moveY,
			pointWidth,
			pointHeight,
			previewTop,
			previewLeft,
		} = this.mouseValues;

		const x = Math.max( 0,
			Math.min(
				pageX - moveX - window.scrollX - previewLeft + ( pointWidth * 0.66),
				this.previewWidth
			)
		);
		const y = Math.max( 0,
			Math.min(
				pageY - moveY - window.scrollY - previewTop + ( pointHeight * 0.66),
				this.previewHeight
			)
		);

		const scaleX = Math.max( x / this.previewWidth, 0.5 );
		const scaleY = Math.max( y / this.previewHeight, 0.5 );

		if ( ! this.classesAdded ) {
			this.classesAdded = true;
			const { appContext } = this.props;
			const { namespace } = appContext;
			this.pointRef.classList.add( `${ namespace }-resizing` );
			this.outputRef.classList.add( `${ namespace }-hide-grid` );
		}

		this.pointRef.style.right = `${ Math.min( this.previewWidth - x, this.previewWidth * 0.5 ) }px`;
		this.pointRef.style.bottom = `${ Math.min( this.previewHeight - y, this.previewHeight * 0.5 ) }px`;
		this.previewRef.style.width = `${ this.previewWidth * scaleX }px`;
		this.previewRef.style.height = `${ this.previewHeight * scaleY }px`;
		this.bgRef.style.width = `${ this.bgWidth * scaleX }px`;
		this.bgRef.style.height = `${ this.bgHeight * scaleY }px`;
	}
	
	/*
	 * @desc cleanup after preview resizing or gradient positioning is finished
	 * @since 1.0.0
	*/
	removeListeners() {
		this.mouseValues = null;
		document.removeEventListener( 'mousemove', this.onMouseMoveResize );
		document.removeEventListener( 'mousemove', this.onMouseMovePosition );
		document.removeEventListener( 'mouseleave', this.onMouseUp );
		document.removeEventListener( 'mouseup', this.onMouseUp );
	}
	
	/*
	 * @desc preview resizing or gradient positioning has finished
	 * @since 1.0.0
	*/
	onMouseUp = () => {
		this.removeListeners();
		if ( this.resizeHidden ) {
			this.resizeHidden = false;
			this.pointRef.style.visibility = null;
		}

		const { appContext } = this.props;
		const { namespace, setCursor } = appContext;
		
		setCursor();
		this.pointRef.classList.remove( `${ namespace }-resizing` );
		this.outputRef.classList.remove( `${ namespace }-hide-grid` );
		this.classesAdded = false;
	}
	
	/*
	 * @desc gradient is "radial" or "conic", where dynamic gradient positioning is allowed within the preview
	 * @since 1.0.0
	*/
	onMouseDownPosition = e => {
		e.preventDefault();
		this.mouseValues = this.previewRef.getBoundingClientRect();
		this.onMouseMovePosition( e, true );
		
		const { appContext } = this.props;
		const { setCursor } = appContext;
		setCursor( 'scroll' );

		document.addEventListener( 'mousemove', this.onMouseMovePosition );
		document.addEventListener( 'mouseleave', this.onMouseUp );
		document.addEventListener( 'mouseup', this.onMouseUp );
	}
	
	/*
	 * @desc user is dragging their mouse around the preview, dynamically changing the gradient positioning
	 * @since 1.0.0
	*/
	onMouseMovePosition = ( e, onDown ) => {
		const { pageX, pageY } = e;
		const { onChangeGradient } = this.context;

		const {
			top: previewTop,
			left: previewLeft,
			width: previewWidth,
			height: previewHeight,
		} = this.mouseValues;

		const x = Math.max( 0,
			Math.min(
				pageX - window.scrollX - previewLeft,
				previewWidth
			)
		);
		const y = Math.max( 0,
			Math.min(
				pageY - window.scrollY - previewTop,
				previewHeight
			)
		);

		if ( ! onDown && ! this.resizeHidden ) {
			this.resizeHidden = true;
			this.pointRef.style.visibility = 'hidden';
		}

		if ( ! this.classesAdded ) {
			this.classesAdded = true;
			const { appContext } = this.props;
			const { namespace } = appContext;
			this.outputRef.classList.add( `${ namespace }-hide-grid` );
		}

		onChangeGradient( 'positions', {
			x: {
				value: ( x / previewWidth * 100 ),
				unit: '%',
			},
			y: {
				value: ( y / previewHeight * 100 ),
				unit: '%',
			},
		} );
	}
	
	/*
	 * @desc has clicked the save preset button, preset will be saved 
	 *       depending on which preview mode is currently selected
	 * @since 1.0.0
	*/
	onSavePreset = () => {
		const { currentMode, onSavePreset } = this.context;
		onSavePreset( currentMode === 'color' ? 'color' : 'gradient', true );
	};
	
	/*
	 * @desc user has clicked an arrow inside the "direction change grid" shown on mouse hover
	 *       used to change the direction for linear gradients
	 * @since 1.0.0
	*/
	changeDirection = value => {
		const direction = getDirection( value );
		const { value: angle } = direction;
		const { onChangeGradient } = this.context;
		onChangeGradient( 'angle', angle );
	};
	
	/*
	 * @desc display the direction grid if the current gradient is linear
	 * @since 1.0.0
	*/
	onMouseEnter = () => {
		this.setState( { hovered: true } );
	};
	
	/*
	 * @desc remove the direction grid if it's currently displayed
	 * @since 1.0.0
	*/
	onMouseLeave = () => {
		this.setState( { hovered: false } );
	};
	
	/*
	 * @desc cleanup for when the content in this class is no longer exists
	 * @since 1.0.0
	*/
	componentWillUnmount() {
		this.removeListeners();
		this.pointRef = null;
		this.outputRef = null;
		this.previewRef = null;
		this.bgRef = null;
	}

	render() {
		const {
			output,
			preview,
			toggleMode,
			currentMode,
			currentColor,
			currentOutput,
			currentGradient,
			value: editorValue,
		} = this.context;

		const { hovered } = this.state;
		const { appContext } = this.props;
		const { namespace } = appContext;
		const { length: editorLength } = editorValue;
		const { angle, type: gradientType } = currentGradient;

		const hasPositions = currentMode !== 'color' && gradientType !== 'linear';
		const positionClass = ! hasPositions ? '' : ` ${ namespace }-gradient-positions`;
		const mouseDownPosition = ! hasPositions ? null : this.onMouseDownPosition;
		const buttonItems = editorLength < 2 ? regularModeItems : fullModeItems;

		let direction;
		const showGrid = hovered && currentMode !== 'color' && gradientType === 'linear';
		if ( showGrid ) {
			const curDirection = getDirection( angle );
			const { direction: angleDirection } = curDirection;
			direction = angleDirection;
		}
		
		let saveDisabled;
		if ( currentMode === 'color' ) {
			const { opacity } = currentColor;
			saveDisabled = opacity === 0;
		}

		return (
			<>
				<div
					className={ `${ namespace }-output` }
					onMouseEnter={ this.onMouseEnter }
					onMouseLeave={ this.onMouseLeave }
					ref={ output => ( this.outputRef = output ) }
				>
					<div
						className={ `${ namespace }-preview${ positionClass }` }
						ref={ preview => ( this.previewRef = preview ) }
						onMouseDown={ mouseDownPosition }
					>
						<div className={ `${ namespace }-preview-inner` }>
							<div
								className={ `${ namespace }-preview-bg` }
								ref={ bg => ( this.bgRef = bg ) }
								style={ preview }
							></div>
							<span className={ `${ namespace }-shade` }></span>
						</div>
					</div>
					<span
						className={ `${ namespace }-resizer` }
						onMouseDown={ this.onMouseDownResize }
						ref={ resizer => ( this.pointRef = resizer ) }
					>
						<Icon type="height" />
					</span>
					{ showGrid && (
						<Grid
							list={ directions }
							value={ direction }
							onClick={ this.changeDirection }
						/>
					) }
				</div>
				<Row className={ `${ namespace }-row-space-between` }>
					<ButtonGroup
						type="small"
						slug="preview-btns"
						items={ buttonItems }
						onChange={ toggleMode }
						active={ currentMode }
					/>
					<SaveBtn
						type="small"
						disabled={ saveDisabled }
						currentOutput={ currentOutput }
						group={ currentMode !== 'color' ? 'gradient' : 'color' }
						onSave={ this.onSavePreset }
					/>
					<CopyBtn type="small" value={ ! saveDisabled ? output : 'transparent' } />
				</Row>
			</>
		);
	}
};

Preview.contextType = EditorContext;

export default withAppContext( Preview );
