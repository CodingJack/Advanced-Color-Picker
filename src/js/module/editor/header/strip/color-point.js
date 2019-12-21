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

class ColorPoint extends Component {
	constructor() {
		super( ...arguments );
	}

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

	pullPoint() {
		const { namespace } = this.context;
		this.pointRef.classList.add( `${ namespace }-gradient-point-pulled` );
		this.pointPulled = true;
	}

	releasePoint() {
		const { namespace } = this.context;
		this.pointRef.classList.remove( `${ namespace }-gradient-point-pulled` );
		this.pointPulled = false;
	}

	removeListeners() {
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseleave', this.onMouseUp );
		document.removeEventListener( 'mouseup', this.onMouseUp );
	}

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
