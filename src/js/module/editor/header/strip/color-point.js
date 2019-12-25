import React from 'react';
import Icon from '../../../../components/icon';

import {
	AppContext,
} from '../../../../context';

import {
	maxPositionPixels,
} from '../../../../data/defaults';

import {
	convertPositionUnit,
} from '../../../../utils/utilities';

const {
	Component,
} = React;

/*
 * @desc represents a single color point in the horizontal linear-gradient strip
 * @since 1.0.0
*/
class ColorPoint extends Component {
	constructor() {
		super( ...arguments );
	}
	
	/*
	 * @desc color point has been clicked, activate it if it isn't currently active
	 *       and then also prepare the point for dragging/repositioning
	 * @since 1.0.0
	*/
	onMouseDown = e => {
		e.preventDefault();
		const { pageX, pageY } = e;
		const { stripRef } = this.props;
		const { current: strip } = stripRef;
		const stripRect = strip.getBoundingClientRect();
		const pointRect = this.pointRef.getBoundingClientRect();

		const {
			left: stripLeft,
			width: stripWidth,
		} = stripRect;

		const {
			height,
			top: pointTop,
			left: pointLeft,
			width: pointWidth,
		} = pointRect;

		const pointHeight = height * 1.5;

		this.mouseValues = {
			pointTop,
			pointHeight,
			stripLeft,
			stripWidth,
			moveX: Math.max( 0,
				Math.min(
					pageX - pointLeft - ( pointWidth * 0.5 ),
					pointWidth
				)
			),
			moveY: Math.max( 0,
				Math.min(
					pageY - pointTop,
					pointHeight
				)
			),
		};

		const { active } = this.props;
		if ( ! active ) {
			const { onActivate, index } = this.props;
			onActivate( index );
		};
		
		const { setCursor } = this.context;
		setCursor( 'default' );

		document.addEventListener( 'mousemove', this.onMouseMove );
		document.addEventListener( 'mouseleave', this.onMouseUp );
		document.addEventListener( 'mouseup', this.onMouseUp );
	}
	
	/*
	 * @desc color point is being dragged, update the current ref if it no longer corresponds to this class
	 *       (can change if the point is dragged beyond another point's position)
	 *       and then update the editor with its new position,
	 *       and also display the "delete" icon if the point is pulled down a certain distance
	 * @since 1.0.0
	*/
	onMouseMove = e => {
		const { pageX, pageY } = e;
		const { canDelete, activeIndex, index, activeUnit } = this.props;

		if( activeIndex !== index ) {
			if ( this.pulled ) {
				this.pointRef.classList.remove( `${ namespace }-gradient-point-pulled` );
			}
			this.pointRef = [ ...this.pointRef.parentElement.children ][ activeIndex ];
		}

		const {
			moveX,
			moveY,
			pointTop,
			pointHeight,
			stripWidth,
			stripLeft,
		} = this.mouseValues;

		const perc = Math.max( 0,
			Math.min(
				pageX - moveX - window.scrollX - stripLeft,
				stripWidth
			)
		);

		let update = true;
		if ( canDelete ) {
			const pull = Math.max( 0,
				Math.min(
					pageY - moveY - window.scrollY - pointTop,
					pointHeight
				)
			);
			if ( pull > pointHeight * 0.75 ) {
				this.pullPoint();
				update = false;
			} else if ( this.pointPulled ) {
				this.releasePoint();
			}
		};

		if ( update ) {
			const value = perc / stripWidth;
			const times = activeUnit === '%' ? 100 : maxPositionPixels;
			const { onChange } = this.props;
			onChange( value * times );
		}
	}
	
	/*
	 * @desc display the "delete" icon if the current point has been pulled down
	 * @since 1.0.0
	*/
	pullPoint() {
		const { namespace } = this.context;
		this.pointRef.classList.add( `${ namespace }-gradient-point-pulled` );
		this.pointPulled = true;
	}
	
	/*
	 * @desc hide the "delete" icon if the current point is no longer being pulled down
	 * @since 1.0.0
	*/
	releasePoint() {
		const { namespace } = this.context;
		this.pointRef.classList.remove( `${ namespace }-gradient-point-pulled` );
		this.pointPulled = false;
	}
	
	/*
	 * @desc cleanup after dragging has finished
	 * @since 1.0.0
	*/
	removeListeners() {
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseleave', this.onMouseUp );
		document.removeEventListener( 'mouseup', this.onMouseUp );
	}
	
	/*
	 * @desc the user is no longer dragging the point
	 *       possibly delete the point if the point has been pulled down (where "delete" icon would be visible)
	 * @since 1.0.0
	*/
	onMouseUp = () => {
		this.removeListeners();
		this.mouseValues = null;

		if ( this.pointPulled ) {
			this.releasePoint();
			const { onDelete } = this.props;
			onDelete();
		}
		
		const { setCursor } = this.context;
		setCursor();
	}
	
	/*
	 * @desc cleanup when the point no longer exists in the editor
	 * @since 1.0.0
	*/
	componentWillUnmount() {
		this.removeListeners();
		this.pointRef = null;
		this.mouseValues = null;
	}

	render() {
		const { namespace } = this.context;
		const { color: colorPoint, active, canDelete } = this.props;
		const { position, preview, unit } = colorPoint;

		const activeClass = ! active ? '' : ` ${ namespace }-gradient-point-active`;
		const pos = unit === '%' ? position : convertPositionUnit( position );

		return (
			<span
				className={ `${ namespace }-gradient-point-wrap${ activeClass }` }
				style={ { left: `${ pos }%` } }
				onMouseDown={ this.onMouseDown }
				ref={ point => ( this.pointRef = point ) }
			>
				<span className={ `${ namespace }-gradient-point-inner` }>
					<span
						className={ `${ namespace }-gradient-point` }
						style={ preview }
					></span>
					{ canDelete && (
						<span className={ `${ namespace }-gradient-point-delete` }>
							<Icon type="delete_forever" />
						</span>
					) }
				</span>
			</span>
		);
	}
}

ColorPoint.contextType = AppContext;

export default ColorPoint;
