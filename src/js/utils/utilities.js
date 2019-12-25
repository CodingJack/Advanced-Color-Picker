import {
	maxPositionPixels,
} from '../data/defaults';

/*
 * @desc formats a floating number to only have 2 max decimal points
 * @since 1.0.0
*/
const toFixed = num => {
	return parseFloat( num.toFixed( 2 ) );
};

/*
 * @desc clamps a number between two other numbers
 * @since 1.0.0
*/
const minMax = ( min, max, value ) => {
	return Math.max( min, Math.min( value, max ) );
};

/*
 * @desc removes trailing commas from a string
 * @since 1.0.0
*/
const trimComma = str => {
	let st = str.trim();
	if ( st.slice( -1 ) === ',' ) {
		return st.slice( 0, -1 );
	}
	return st;
};

/*
 * @desc converts percentage-based positions to pixels and vice versa
 * @since 1.0.0
*/
const convertPositionUnit = ( value, px ) => {
	if ( ! px ) {
		return ( value / maxPositionPixels ) * 100;
	}
	return maxPositionPixels * ( value * 0.01 );
};

/*
 * @desc normalize sorting between browsers to account for differences when identical values exist to ensure that 
 *       consecutive colors with identical stop values maintain their respective order (which matters for CSS gradients)
 *       https://jsfiddle.net/r7gmxf92/
 * @since 1.0.0
*/
const sortCompareAlt = ( () => {
	return [ {index: 0, val: 0}, {index: 1, val: 0} ].sort( ( a, b ) => a.val >= b.val )[0].index;
} )();

const sortCompare = ( a, b ) => {
	return ! sortCompareAlt ? a >= b ? 1 : -1 : a > b ? 1 : -1;
};

export {
	minMax,
	toFixed,
	trimComma,
	sortCompare,
	convertPositionUnit,
}