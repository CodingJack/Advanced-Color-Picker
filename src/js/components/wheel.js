import React from 'react';
import InputField from './inputs/input-field';

import {
	AppContext,
} from '../context';

const {
	PureComponent,
} = React;

class Wheel extends PureComponent {
	constructor() {
		super( ...arguments );
	}

	onMouseDown = e => {
		e.preventDefault();
		
		const rect = this.ref.getBoundingClientRect();
		const { top, left, width } = rect;
		const { setCursor } = this.context;

		this.mouseValues = {
			wheelCenter: ( width * 0.5 ) + 5,
			moveX: left,
			moveY: top,
		}

		setCursor( 'wheel' );
		this.updating = true;
		this.onMouseMove( e );

		document.addEventListener( 'mousemove', this.onMouseMove );
		document.addEventListener( 'mouseleave', this.onMouseUp );
		document.addEventListener( 'mouseup', this.onMouseUp );
	};

	onMouseMove = e => {
		const { pageX, pageY } = e;
		const { moveX, moveY, wheelCenter } = this.mouseValues;
		const posX = pageX - moveX - window.scrollX;
		const posY = pageY - moveY - window.scrollY;

		let value = Math.atan2( posY - wheelCenter, posX - wheelCenter ) * ( 180 / Math.PI ) + 90;
		if( value < 0 ) value += 360;
		value = Math.max( 0, Math.min( 360, Math.round( value ) ) );

		const { onChange, type } = this.props;
		onChange( value, type, this.updating );
	};

	removeListeners() {
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseleave', this.onMouseUp );
		document.removeEventListener( 'mouseup', this.onMouseUp );
	}

	onMouseUp = e => {
		this.removeListeners();
		const { setCursor } = this.context;
		
		setCursor();
		this.updating = false;
		this.onMouseMove( e );
	}

	onChange = ( value, type, updating ) => {
		const { onChange } = this.props;
		onChange( value, type, updating );
	}

	componentWillUnmount() {
		this.removeListeners();
	}

	render() {
		const { value } = this.props;
		const { namespace } = this.context;

		return (
			<>
				<InputField
					slider
					prop="angle"
					label="Angle"
					max={ 360 }
					value={ value }
					onChange={ this.onChange }
				/>
				<span
					className={ `${ namespace }-wheel` }
					onMouseDown={ this.onMouseDown }
					ref={ ref => ( this.ref = ref ) }
				>
					<span className={ `${ namespace }-wheel-inner` }>
						<span
							className={ `${ namespace }-wheel-point` }
							style={ { transform: `rotate(${ value }deg)` } }
						></span>
					</span>
				</span>
			</>
		);
	}
};

Wheel.contextType = AppContext;

export default( Wheel );
