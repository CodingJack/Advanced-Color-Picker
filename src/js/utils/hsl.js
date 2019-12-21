import {
	getRgbHslValues,
} from './colors';

// https://github.com/Qix-/color-convert/blob/master/conversions.js
const hslToRgb = ( hh, ss, ll ) => {
	const h = hh / 360;
	const s = ss / 100;
	const l = ll / 100;
	
	let t2;
	let t3;
	let val;

	if ( s === 0 ) {
		val = l * 255;
		return [ val, val, val ];
	}
	if ( l < 0.5 ) {
		t2 = l * ( 1 + s );
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;
	const rgb = [ 0, 0, 0 ];
	
	for ( let i = 0; i < 3; i++ ) {
		t3 = h + 1 / 3 * -( i - 1 );
		if ( t3 < 0 ) t3++;
		if ( t3 > 1 ) t3--;

		if ( 6 * t3 < 1 ) {
			val = t1 + ( t2 - t1 ) * 6 * t3;
		} else if ( 2 * t3 < 1 ) {
			val = t2;
		} else if ( 3 * t3 < 2 ) {
			val = t1 + ( t2 - t1 ) * ( 2 / 3 - t3 ) * 6;
		} else {
			val = t1;
		}

		rgb[ i ] = val * 255;
	}
	
	return rgb;
};

// https://github.com/Qix-/color-convert/blob/master/conversions.js
const toHsl = ( rr, gg, bb ) => {
	const r = rr / 255;
	const g = gg / 255;
	const b = bb / 255;
	
	const min = Math.min( r, g, b );
	const max = Math.max( r, g, b );
	const delta = max - min;
	
	let h;
	let s;
	let l = ( min + max ) / 2;

	if ( max === min ) {
		h = 0;
	} else if ( r === max ) {
		h = ( g - b ) / delta;
	} else if ( g === max ) {
		h = 2 + ( b - r ) / delta;
	} else {
		h = 4 + ( r - g ) / delta;
	}

	h = Math.min( h * 60, 360 );
	if ( h < 0 ) h += 360;

	if ( max === min ) {
		s = 0;
	} else if ( l <= 0.5 ) {
		s = delta / ( max + min );
	} else {
		s = delta / ( 2 - max - min );
	}
	
	s *= 100;
	l *= 100;
	
	return [ h, s, l ];
};

const toHsb = ( rr, gg, bb ) => {
	const max = Math.max( rr, gg, bb );
	const delta = max - Math.min( rr, gg, bb );
	
	let h = 0;
	let s = max !== 0 ? 255 * delta / max : 0;
	let b = max;
	
	if ( s !== 0 ) {
		if ( rr === max ) {
			h = ( gg - bb ) / delta;
		} else if ( gg === max ) {
			h = 2 + ( bb - rr ) / delta;
		} else {
			h = 4 + ( rr - gg ) / delta;
		}
	} else {
		h = -1;
	}
	
	h *= 60;
	s *= 100 / 255;
	b *= 100 / 255;
	
	if ( h < 0 ) {
		h += 360;
	}
	if( h === 300 && s === 0 ) {
		h = 0;
	}
	
	return { h, s, b };
};

const hsbaData = color => {
	const hsb = toHsb( ...color );
	const { h, s, b } = hsb;
	return { h, b, alpha: ( 100 - s ) / 100 };
}

const getValuesFromHsl = clr => {
	const hsla = getRgbHslValues( clr, true );
	const opacity = hsla[3];
	hsla.pop();
	
	const color = hslToRgb( ...hsla );
	color[3] = opacity;
	return color;
};

export {
	toHsl,
	hsbaData,
	hslToRgb,
	getValuesFromHsl,
}