/*
 * The functions in this file are used for converting CSS color strings into data and vice versa
*/

import {
	colorNameKeys,
} from '../data/color-names';

import {
	regRgb,
	regRgba,
	regHsl,
	regHsla,
} from './regexp';

/*
 * @desc formats opacity values into a number with max 2 decimals
 * @param string|number alpha - the opacity value to process
 * @returns number
 * @since 1.0.0
*/
const sanitizeAlpha = alpha => {
	return parseFloat( 
		Math.max( 
			Math.min( 
				parseFloat( alpha ), 1 
			), 0 
		).toFixed(2).replace( /\.?0*$/ , '' ) 
	);
};

/*
 * @desc converts rgba/hsla data into an rgba/hsla CSS color
 * @param string type - "rgb" or "hsl"
 * @returns string
 * @since 1.0.0
*/
const rgbHslString = ( rr, gg, bb, aa, type ) => {
	const r = Math.round( rr );
	const g = Math.round( gg );
	const b = Math.round( bb );
	const a = sanitizeAlpha( aa );
	
	if ( type ) {
		const perc = type === 'rgb' ? '' : '%';
		if ( a === 1 ) {
			return `${ type }(${ r }, ${ g }${ perc }, ${ b }${ perc })`;
		}
		return `${ type }a(${ r }, ${ g }${ perc }, ${ b }${ perc }, ${ a })`;
	}
	return `rgba(${ r },${ g },${ b },${ a })`;
};

/*
 * @desc converts rgb/hsl value into a hex value
 * @returns string
 * @since 1.0.0
*/
const toHex = c => {
	return ( '0' + parseInt( c, 10 ).toString( 16 ) ).slice( -2 ).toUpperCase();
};

/*
 * @desc converts rgb data into a CSS hex color
 * @param string reduce - final output will attempt to reduce 6 digit hex to 3
 * @returns string
 * @since 1.0.0
*/
const rgbToHex = ( r, g, b, reduce = true ) => {
	let hex = `#${ toHex( r ) }${ toHex( g ) }${ toHex( b ) }`;
	if ( reduce ) {
		hex = reduceHex( hex );
	}
	return hex;
};

/*
 * @desc tests if a string is a valid rgb/rgba/hsl/hsla CSS color
 * @returns boolean
 * @since 1.0.0
*/
const isValidRgbHsl = color => {
	return regRgb.test( color ) || 
		   regRgba.test( color ) ||
		   regHsl.test( color ) || 
		   regHsla.test( color );
};

/*
 * @desc tests if a string is a valid CSS color
 * @returns boolean
 * @since 1.0.0
*/
const isValidColor = ( color, varyingLength ) => {
	return isValidHex( color, varyingLength ) || 
		   colorNameKeys.includes( color ) || 
		   isValidRgbHsl( color.replace( /\s/g, '' ) );
};

/*
 * @desc converts a 3 digit hex color into 6 digits
 * @returns string
 * @since 1.0.0
*/
const fullHex = hex => {
	const a = hex.charAt( 0 );
	const b = hex.charAt( 1 );
	const c = hex.charAt( 2 );
		
	return `${ a }${ a }${ b }${ b }${ c }${ c }`;
};

/*
 * @desc attempts to convert a 3 digit hex color into 6 digits
 * @returns string
 * @since 1.0.0
*/
const toFullHex = color => {
	let hex = color.replace( '#' , '' );
	if( hex.length === 3 ) {
		hex = fullHex( hex );
	}
	return `#${ hex.toUpperCase() }`;
};

/*
 * @desc attempts to convert a 6 digit hex color into 3 digits
 * @returns string
 * @since 1.0.0
*/
const reduceHex = ( clr, fromOutput ) => {
	let color = clr.toLowerCase();
	if ( color.charAt( 0 ) === '#' ) {
		if ( fromOutput ) {
			color = color.toUpperCase();
		}
		if ( color.charAt( 1 ) === color.charAt( 2 ) &&
			 color.charAt( 3 ) === color.charAt( 4 ) &&
			 color.charAt( 5 ) === color.charAt( 6 ) ) 
		{
			return `#${ color.charAt( 1 ) }${ color.charAt( 3 ) }${ color.charAt( 5 ) }`;
		}
	}
	
	return color;
};

/*
 * @desc converts a hex color and opacity value into rgba data
 * @returns array
 * @since 1.0.0
*/
const hexToRGB = ( color, opacity ) => {
	let hex = color.replace( '#' , '' );
	if( hex.length === 3 ) {
		hex = fullHex( hex );
	}
	
	const newColor = [
		parseInt( hex.substring( 0, 2 ), 16 ),
		parseInt( hex.substring( 2, 4 ), 16 ),
		parseInt( hex.substring( 4, 6 ), 16 ),
	];
	
	if ( opacity ) {
		newColor[3] = 1;
	}
	
	return newColor;
};

/*
 * @desc converts a valid rgb/rgba/hsl/hsla string into data values
 * @returns array
 * @since 1.0.0
*/
const getRgbHslValues = ( color, hsl ) => {
	let clr = color.replace( /\s/g, '' );
	if( clr.search( /,\)/ ) !== -1 ) {
		clr = `${ clr.split( ',)' )[0] },1)`;
	}
	
	const values = clr.substring( 
		clr.indexOf( '(' ) + 1, 
		clr.lastIndexOf( ')' ) 
	).split( ',' );
	
	while( values.length < 3 ) {
		values.push( 0 );
	}
	if( values.length === 3 ) {
		values.push( 1 );
	}
	
	for( let i = 0; i < 4; i++ ) {
		if ( i < 3 ) {
			const max = ! hsl ? 255 : i > 0 ? 100 : 360;
			values[i] = Math.min( max, 
				Math.max( 0,
					parseInt( values[i], 10 ) 
				) 
			);
		} else {
			values[i] = Math.min( 1, 
				Math.max( 0, 
					parseFloat( values[i] ) 
				) 
			);
		}
	}
	
	return values;
};

/*
 * @desc converts a valid hex string into rgba data
 * @returns array
 * @since 1.0.0
*/
const getValuesFromHex = color => {
	let hex;
	if ( isValidHex( color, true ) ) {
		hex = color.replace( '#', '' ).trim();
	} else {
		hex = '000000';
	}
	
	const rgba = hexToRGB( hex );
	rgba[3] = 1;
	return rgba;
};

/*
 * @desc checks if a string is a valid hex
 * @param string varyingNumbers - if the string can be 3 digits and also 6 digits
 * @returns boolean
 * @since 1.0.0
*/
const isValidHex = ( color, varyingNumbers ) => {
	if ( ! varyingNumbers ) {
		return /(^#[0-9A-F]{6}$)/i.test( color );
	}
	
	return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test( color );
}

/*
 * @desc checks if a data value exists as an rgba data value
 * @returns boolean
 * @since 1.0.0
*/
const isValidRGB = rgb => {
	if ( ! Array.isArray( rgb ) || rgb.length !== 3 ) {
		return false;
	}
	
	for ( let i = 0; i < 3; i++ ) {
		const value = rgb[i];
		if ( isNaN( value ) || value < 0 || value > 255 ) {
			return false;
		}
	}
	
	return true;
};

/*
 * @desc converts a string into a valid CSS color for the editor
 * @returns string
 * @since 1.0.0
*/
const cssColor = color => {
	if ( typeof color === 'string' ) {
		return reduceHex( color );
	}
	if ( Array.isArray( color ) ) {
		if( color[ 3 ] === 1 ) {
			return rgbToHex( ...color );
		}
		return rgbHslString( ...color );
	}

	return rgbToHex( color );
};

/*
 * @desc converts rgb data into a hex for the editor
 * @returns string
 * @since 1.0.0
*/
const getRawHex = value => {
	if ( Array.isArray( value ) ) {
		const rgb = value.slice( 0, 3 );
		rgb[3] = 1;
		return cssColor( rgb );
	}
	
	return '#000';
};

/*
 * @desc verifies that an incoming input value is valid
 * @param string mode - the editor mode ("single color" or "gradients")
 * @param RegExpr regGradient - the predefined RegExpr used to test gradient strings (conic or no conic)
 * @param boolean allowConic - if the editor supports "conic mode" or not
 * @returns string - the original color or "transparent" for invalid values
 * @since 1.0.0
*/
const verifyColorBySettings = ( clr, mode, regGradient, allowConic ) => {
	if ( mode !== 'single' ) {
		if ( ! allowConic && clr.search( 'conic' ) !== -1 ) {
			return 'transparent';
		}
		return clr;
	}
	
	const color = clr.replace( /;/g, '').replace( /-webkit-|-moz-/, '' ).toLowerCase();
	if ( regGradient.test( color ) ) {
		return 'transparent';
	}
	
	return clr;
};

export {
	cssColor,
	hexToRGB,
	rgbToHex,
	toFullHex,
	reduceHex,
	getRawHex,
	isValidHex,
	isValidRGB,
	rgbHslString,
	isValidRgbHsl,
	isValidColor,
	sanitizeAlpha,
	getValuesFromHex,
	getRgbHslValues,
	verifyColorBySettings,
};