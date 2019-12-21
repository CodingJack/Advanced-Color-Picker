import {
	maxPositionPixels,
} from '../data/defaults';

const toFixed = num => {
	return parseFloat( num.toFixed( 2 ) );
};

const minMax = ( min, max, value ) => {
	return Math.max( min, Math.min( value, max ) );
};

const trimComma = str => {
	let st = str.trim();
	if ( st.slice( -1 ) === ',' ) {
		return st.slice( 0, -1 );
	}
	return st;
};

const convertPositionUnit = ( value, px ) => {
	if ( ! px ) {
		return ( value / maxPositionPixels ) * 100;
	}
	return maxPositionPixels * ( value * 0.01 );
};

export {
	minMax,
	toFixed,
	trimComma,
	convertPositionUnit,
}