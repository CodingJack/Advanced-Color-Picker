import {
	colorNameKeys,
} from '../data/color-names';

import {
	regRgb,
	regRgba,
	regHsl,
	regHsla,
} from './regexp';

const sanitizeAlpha = alpha => {
	return parseFloat( 
		Math.max( 
			Math.min( 
				parseFloat( alpha ), 1 
			), 0 
		).toFixed(2).replace( /\.?0*$/ , '' ) 
	);
};

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

const toHex = ( c ) => {
	return ( '0' + parseInt( c, 10 ).toString( 16 ) ).slice( -2 ).toUpperCase();
};

const rgbToHex = ( r, g, b, reduce = true ) => {
	let hex = `#${ toHex( r ) }${ toHex( g ) }${ toHex( b ) }`;
	if ( reduce ) {
		hex = reduceHex( hex );
	}
	return hex;
};

const isValidRgbHsl = color => {
	return regRgb.test( color ) || 
		   regRgba.test( color ) ||
		   regHsl.test( color ) || 
		   regHsla.test( color );
};

const isValidColor = ( color, varyingLength ) => {
	return isValidHex( color, varyingLength ) || 
		   colorNameKeys.includes( color ) || 
		   isValidRgbHsl( color.replace( /\s/g, '' ) );
};

const fullHex = hex => {
	const a = hex.charAt( 0 );
	const b = hex.charAt( 1 );
	const c = hex.charAt( 2 );
		
	return `${ a }${ a }${ b }${ b }${ c }${ c }`;
};

const toFullHex = color => {
	let hex = color.replace( '#' , '' );
	if( hex.length === 3 ) {
		hex = fullHex( hex );
	}
	return `#${ hex.toUpperCase() }`;
};

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

const isValidHex = ( color, varyingNumbers ) => {
	if ( ! varyingNumbers ) {
		return /(^#[0-9A-F]{6}$)/i.test( color );
	}
	
	return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test( color );
}

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

const getRawHex = value => {
	if ( Array.isArray( value ) ) {
		const rgb = value.slice( 0, 3 );
		rgb[3] = 1;
		return cssColor( rgb );
	}
	
	return '#000';
};

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