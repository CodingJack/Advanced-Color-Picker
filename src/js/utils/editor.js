import {
	convertPositionUnit,
} from './utilities';

const deepClone = value => {
	const str = JSON.stringify( value );
	return JSON.parse( str );
};

const immutable = value => {
	if ( Array.isArray( value ) ) {
		return Array.from( value );
	} else if ( typeof value === 'object' ) {
		return { ...value };
	}
	
	return value;
}

const isValidInput = ( value, min, max ) => {
	if ( value === '' || ! ( /^\d+$/.test( value ) ) ) {
		return false;
	}
	
	const newValue = parseInt( value, 10 );
	if( newValue < min || newValue > max ) {
		return false;
	}
	
	return true;
};

const reversePositions = itm => {
	let { position, unit } = itm;
	if ( unit === 'px' ) {
		position = convertPositionUnit( position );
	}
	if ( position < 50 ) {
		position += ( 50 - position ) * 2;
	} else {
		position -= ( position - 50 ) * 2;
	}
	if ( unit === 'px' ) {
		position = convertPositionUnit( position, true );
	}
	
	itm.position = position;
};

const getNextPosition = ( colors, index ) => {
	const { length } = colors;
	const nextIndex = index + 1 < length ? index + 1 : length - 1;
	const endColor = colors[ nextIndex ];
	
	const { unit: endUnit, position: endPos } = endColor;
	const lastPos = endUnit === '%' ? endPos : convertPositionUnit( endPos );
	
	if ( length < 2 ) {
		return lastPos < 100 ? 100 : 0;
	}
	if ( nextIndex === length - 1 && lastPos < 100 ) {
		return 100;
	}
	
	const startIndex = index !== nextIndex ? index : index - 1;
	const startColor = colors[ startIndex ];
	const { unit: startUnit, position: startPos } = startColor;
	const firstPos = startUnit === '%' ? startPos : convertPositionUnit( startPos );
	
	return firstPos + ( ( lastPos - firstPos ) * 0.5 );
};

const getDirection = angle => {
	switch( angle ) {
		case 0:
		case 360:
		case 'top':
			return { direction: 'top', value: 0 };
		case 180:
		case 'bottom':
			return { direction: 'bottom', value: 180 };
		case 270:
		case 'left':
			return { direction: 'left', value: 270 };
		case 90:
		case 'right':
			return { direction: 'right', value: 90 };
		case 45:
		case 'right_top':
			return { direction: 'right_top', value: 45 };
		case 135:
		case 'right_bottom':
			return { direction: 'right_bottom', value: 135 };
		case 225:
		case 'left_bottom':
			return { direction: 'left_bottom', value: 225 };
		case 315:
		case 'left_top':
			return { direction: 'left_top', value: 315 };
	}
	
	return { 
		direction: 'degree', 
		value: isNaN( angle ) ? 125 : angle,
	};
};

const writeHintData = ( colors, hints, positions ) => {
	if ( colors.length < 2 ) {
		return;
	}
	
	hints.forEach( ( hint, index ) => {
		let prevColor = colors[ index ];
		let nextColor = colors[ index + 1 ];
		
		const { position: prevColorPos, unit: prevColorUnit } = prevColor;
		const { position: nextColorPos, unit: nextColorUnit } = nextColor;
		
		const posOne = prevColorUnit === '%' ? prevColorPos : convertPositionUnit( prevColorPos );
		const posTwo = nextColorUnit === '%' ? nextColorPos : convertPositionUnit( nextColorPos );
		
		const minPos = Math.min( posOne, posTwo );
		const maxPos = Math.max( posOne, posTwo );
		const difPos = maxPos - minPos;		
		
		if ( positions ) {
			const { percentage } = hint;
			hint.position = minPos + ( difPos * ( percentage * 0.01 ) );
		} else {
			const { position } = hint;
			let perc = ( ( position - minPos ) / ( maxPos - minPos ) ) * 100;
			if ( isNaN( perc ) ) {
				perc = 50;
			}
			hint.percentage = perc;
		}
	} );
};

export {
	immutable,
	deepClone,
	isValidInput,
	getDirection,
	writeHintData,
	getNextPosition,
	reversePositions,
}