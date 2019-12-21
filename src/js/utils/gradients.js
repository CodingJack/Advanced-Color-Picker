import {
	minMax,
	toFixed,
	convertPositionUnit,
} from './utilities';

import {
	defaultGradient,
	maxPositionPixels,
	defGradientColors,
} from '../data/defaults';

import {
	colorNames,
	colorRegExp,
	colorNameKeys,
} from '../data/color-names';

import {
	cssColor,
	getRawHex,
	isValidHex,
	isValidRgbHsl,
	getRgbHslValues,
	getValuesFromHex,
} from './colors';

import {
	getValuesFromHsl,
} from './hsl';


const trimItm = itm => itm.trim();
const trimItems = ( st, items ) => {
	let str = st;
	items.forEach( itm => {
		str = str.split( itm ).map( trimItm ).join( itm );
	} );
	return str;
}

const verifyGradColor = ( clr, conic ) => {
	const color = clr.trim().replace( /\s\s+/g, ' ' );
	const hint = parseInt( color, 10 );
	
	if ( ! isNaN( hint ) ) {
		if ( conic && clr.search( '%' ) === -1 ) {
			return getConicPosition( clr );
		}
		return hint;
	}
	
	const colorData = color.split( ' ' );
	const start = colorData[0].toLowerCase();
	let end;
	
	if ( colorData.length > 1 ) {
		const positions = colorData.slice();
		positions.shift();
		end = ` ${ positions.join( ' ' ) }`;
	} else {
		end = '';
	}
	
	if( start === 'transparent' ) {
		return `${ start }${ end }`;
	}
	if ( colorNameKeys.includes( start ) ) {
		return `${ colorNames[ start ] }${ end }`;
	}	
	if ( start.charAt(0) === '#' && isValidHex( start, true ) ) {
		return `${ start }${ end }`;
	}
	if ( isValidRgbHsl( start ) ) {
		return `${ start }${ end }`;
	}
	
	return `#FFFFFF${ end }`; 
};

const getAngleFromSides = angle => {
	switch ( angle ) {
		case 'top':
			return 0;
		case 'bottom':
			return 180;
		case 'right':
			return 90;
		case 'left':
			return 270;
		case 'top left':
		case 'left top':
			return 315;
		case 'top right':
		case 'right top':
			return 45;
		case 'bottom left':
		case 'left bottom':
			return 225;
		case 'bottom right':
		case 'right bottom':
			return 135;
	}
	
	return 180;
};

const getRadialExtent = grad => {
	if ( grad.search( 'closest-side' ) !== -1 ) {
		return 'closest-side';
	}
	if ( grad.search( 'closest-corner' ) !== -1 ) {
		return 'closest-corner';
	}
	if ( grad.search( 'farthest-side' ) !== -1 ) {
		return 'farthest-side';
	}
	
	return 'farthest-corner';
};

const getPosition = position => {
	switch( position ) {
		case 'left':
		case 'top':
			return { value: 0, unit: '%' };
		case 'right':
		case 'bottom':
			return { value: 100, unit: '%' };
	}
	
	const unit = position.slice( -2 ) !== 'px' ? '%' : 'px';
	const value = parseInt( position.replace( /%|px/g, '' ) , 10 );
	
	if ( ! isNaN( value ) ) {
		return { value, unit };
	}
	
	return { value: 50, unit: '%' };
};

const normalizePositions = positions => {
	const firstPos = positions[0].trim();
	const lastPos = positions[1].trim();
	
	if ( firstPos === 'top' || 
		 firstPos === 'bottom' || 
		 lastPos === 'left' || 
		 lastPos === 'right' 
	) {
		return [ lastPos, firstPos ];
	}
	
	return positions;
};

const getGradientPositions = prefix => {
	if ( prefix.search( 'at ' ) === -1 ) {
		return { 
			x: { value: 50, unit: '%' }, 
			y: { value: 50, unit: '%' },
		};
	}
	
	let positions = prefix.split( 'at ' );
	positions.shift();
	positions = positions.join( '' ).split( ' ' );
	
	if ( positions.length > 1 ) {
		positions = normalizePositions( positions );
	} else {
		const pos = positions[0].trim();
		if ( pos === 'top' || pos === 'bottom' ) {
			positions = [ '50%', pos ];
		}
	}
	
	const x = getPosition( positions[0] );
	let y;
	
	if ( positions.length === 1 ) {
		y = { value: 50, unit: '%' };
	} else {
		y = getPosition( positions[1] );
	}
	
	return { x, y };
};

const getRadialShape = shape => {
	if ( shape.search( /ellipse|circle/ ) === -1 ) {
		let prefix = shape.split( 'at' );
		if ( prefix.length > 1 ) {
			prefix = prefix[0].trim();
			if ( prefix.search( /side|corner/ ) !== -1 ) {
				return 'ellipse';
			}
			return 'size';
		}
		return ! shape.trim() ? 'ellipse' : 'size';
	}
	return shape.search( 'ellipse' ) !== -1 ? 'ellipse' : 'circle';
};

const getRadialSizes = ( prefix, shape ) => {
	if ( shape !== 'size' ) {
		return { 
			x: { value: 75, unit: '%' }, 
			y: { value: 75, unit: '%' }, 
		};
	}
	
	const sizes = prefix.split( 'at' )[0].trim().split( ' ' );
	if ( sizes.length === 1 ) {
		const unit = sizes[0].slice( -2 ) !== 'px' ? '%' : 'px';
		if ( unit === '%' ) {
			return { 
				x: { value: 75, unit: '%' }, 
				y: { value: 75, unit: '%' }, 
			};
		}
		
		const value = parseInt( sizes[0].replace( 'px', '' ), 10 );
		return { 
			x: { value, unit: 'px' }, 
			y: { value, unit: 'px' }, 
		};
	}
	
	const unitW = sizes[0].slice( -2 ) !== 'px' ? '%' : 'px';
	const unitH = sizes[1].slice( -2 ) !== 'px' ? '%' : 'px';
	
	const maxW = unitW === '%' ? 100 : maxPositionPixels;
	const maxH = unitH === '%' ? 100 : maxPositionPixels;
	
	const width = minMax( 0, maxW, parseInt( sizes[0].replace( /%|px/g, '' ), 10 ) );
	const height = minMax( 0, maxH, parseInt( sizes[1].replace( /%|px/g, '' ), 10 ) );
	
	return { 
		x: { value: width, unit: unitW }, 
		y: { value: height, unit: unitH }, 
	};
};

const linearGradientData = prefix => {
	let angle;
	
	if ( prefix.search( 'deg' ) !== -1 ) {
		angle = prefix.replace( 'deg', '' );
		const parsed = parseInt( angle, 10 );
		angle = ! isNaN( parsed ) ? minMax( -360, 360, parsed ) : 180;
		if ( angle < 0 ) {
			angle += 360;
		}
	} 
	else if ( prefix.search( 'to ' ) !== -1 ) {
		angle = prefix.replace( 'to ', '' );
		angle = getAngleFromSides( angle );
	} 
	else if ( prefix.search( 'turn' ) !== -1 ) {
		angle = prefix.replace( 'turn', '' );
		const parsed = parseFloat( angle );
		angle = isNaN( parsed ) || parsed < 0 || parsed > 1 ? 180 : parsed * 360;
	} 
	else {
		angle = 180;
	}
	
	return { angle };
};

const getConicAngle = gradAngle => {
	let conicAngle = gradAngle.replace( 'from', '' ).trim();
	let angle = 0;
	
	if ( conicAngle.search( '%' ) !== -1 ) {
		angle = conicAngle.replace( '%', '' );
		angle = minMax( 0, 100, parseInt( angle, 10 ) ) * 0.01 * 360;
	}
	else if ( conicAngle.search( 'deg' ) !== -1 ) {
		angle = conicAngle.replace( 'deg', '' );
		angle = parseInt( angle, 10 );
	}
	else if ( conicAngle.search( 'turn' ) !== -1 ) {
		angle = conicAngle.replace( 'turn', '' );
		angle = minMax( 0, 1, parseFloat( angle ) );
		angle = Math.round( angle * 360 );
	}
	else if ( conicAngle.search( 'grad' ) !== -1 ) {
		angle = conicAngle.replace( 'grad', '' );
		angle = minMax( 0, 400, parseInt( angle, 10 ) );
		angle = Math.round( ( angle / 400 ) * 360 );
	}
	else if ( conicAngle.search( 'rad' ) !== -1 ) {
		angle = conicAngle.replace( 'rad', '' );
		angle = parseFloat( angle );
		angle *= ( 180 / Math.PI );
		angle = Math.round( angle );
	}
	
	angle = minMax( -360, 360, angle );
	if ( angle < 0 ) {
		angle += 360;
	}
	
	return ! isNaN( angle ) ? angle : 0;
};

const conicGradientData = prefix => {
	const hasAngle = prefix.search( 'from ' ) !== -1;
	const hasPosition = prefix.search( 'at ' ) !== -1;
	
	const data = prefix.split( 'at' );
	const angle = ! hasAngle ? 0 : getConicAngle( data[0] );
	
	if ( ! hasPosition || data.length < 2 ) {
		return {
			angle,
			positions: { 
				x: { value: 50, unit: '%' }, 
				y: { value: 50, unit: '%' },
			},
		};
	}
	return {
		angle,
		positions: getGradientPositions( `at ${ data[1].trim() }` ),
	}
};

const radialGradientData = prefix => {
	const shape = getRadialShape( prefix );
	
	return {
		shape,
		extent: getRadialExtent( prefix ),
		sizes: getRadialSizes( prefix, shape ),
		positions: getGradientPositions( prefix ),
	}
}

const getGradientData = ( type, prefix ) => {
	if ( prefix.search( /#|rgb|hsl/ ) !== -1 ) {
		return defaultGradient();
	}
	switch( type ) {
		case 'linear':
			return linearGradientData( prefix );
		case 'radial':
			return radialGradientData( prefix );
	}
	return conicGradientData( prefix );
};

const calcGradPosition = ( 
	colors, 
	index, 
	total, 
	curPoint, 
	lastPoint, 
	lastIndex 
) => {
	let realTotal = total + 1;
	let stretch = ( index + 1 ) - ( lastIndex + 1 );
	
	for ( let i = index; i < realTotal; i++ ) {
		const clr = colors[i].split( ' ' );
		if ( clr.length === 1 ) {
			stretch++;
			continue;
		}
		
		let nextPoint;
		const unit = clr[1].slice( -2 ) !== 'px' ? '%' : 'px';
		if ( unit === '%' ) {
			nextPoint = minMax( 0, 100, parseFloat( clr[1].replace( '%', '' ) ) ); 
		} else {
			const point = minMax( 0, maxPositionPixels, parseInt( clr[1].replace( 'px', '' ), 10 ) );
			nextPoint = minMax( 0, 100, convertPositionUnit( point ) );
		}
		
		return toFixed( curPoint + ( ( nextPoint - lastPoint ) / stretch ) );
	}
};

const getGradientColor = clr => {
	if( ! clr || typeof clr !== 'string' || clr.toLowerCase().trim() === 'transparent' ) {
		return [0, 0, 0, 0];
	} 
	else if ( clr.charAt(0) === '#' ) {
		return getValuesFromHex( clr );
	} 
	else if ( clr.search( 'rgb' ) !== -1 ) {
		return getRgbHslValues( clr );
	} 
	else if ( clr.search( 'hsl' ) !== -1 ) {
		return getValuesFromHsl( clr );
	} 
	
	return [255, 255, 255, 1];
}

const getGradientColorData = colors => {
	const total = colors.length - 1;
	const startColor = colors[0].split( ' ' );
	const endColor = colors[ total ].split( ' ' );
	
	let lastPoint;
	let lastIndex;
	let curPoint;
	
	if ( startColor.length < 2 ) {
		colors[0] = `${ colors[0] } 0%`;
	}
	if ( endColor.length < 2 ) {
		colors[total] = `${ colors[total] } 100%`;
	}
	
	const newColors = colors.map( ( color, index ) => {
		const clr = color.split( ' ' );
		const value = getGradientColor( clr[0] );
		let curPos;
		let unit;
		
		if ( clr.length === 1 ) {
			unit = '%';
			curPoint = calcGradPosition( 
				colors, 
				index, 
				total, 
				curPoint, 
				lastPoint, 
				lastIndex 
			);
			curPos = curPoint;
		} else {
			lastIndex = index;
			unit = clr[1].slice( -2 ) !== 'px' ? '%' : 'px';
			if ( unit === '%' ) {
				lastPoint = minMax( 0, 100, 
					toFixed( parseFloat( clr[1].replace( '%', '' ) ) ) 
				);
				curPos = lastPoint;
			} else {
				curPos = minMax( 0, maxPositionPixels, 
					parseInt( clr[1].replace( 'px', '' ), 10 ) 
				);
				lastPoint = minMax( 0, convertPositionUnit( curPos ), 100 );
			}	
			curPoint = lastPoint;
		}
		return writeGradientColor( value, curPos, unit );
	} );
	
	minPositionPoints( newColors );
	sortByPosition( newColors, true );

	return newColors;
};

const getRadialPosition = angle => {
	if ( angle.search( 'deg' ) === -1 ) {
		const val = parseInt( angle.replace( /%|px/g, '' ), 10 );
		return ! isNaN( val ) ? val : 0;
	}
	
	const degree = parseInt( angle.replace( 'deg' ), 10 );
	return ! isNaN( degree ) ? ( minMax( 0, 1, degree / 360 ) ) * 100 : 0;
};

const getConicPosition = angle => {
	return ( getConicAngle( angle ) / 360 ) * 100; 
};

const formatGradientPositions = ( clr, type ) => {
	if ( ! isNaN( clr ) ) {
		return [ clr ];
	}
	
	let colorData = clr.replace( /  +/g, ' ' ).split( ' ' );
	if ( colorData.length > 2 ) {
		let pointA;
		let pointB;
		
		const unitA = colorData[1].search( '%' ) !== -1 ? '%' : 'px';
		const unitB = colorData[2].search( '%' ) !== -1 ? '%' : 'px';
		
		switch( type ) {
			case 'linear':
				pointA = parseInt( colorData[1].replace( /%|px/g, '' ), 10 );
				pointB = parseInt( colorData[2].replace( /%|px/g, '' ), 10 );
				if ( isNaN( pointA ) ) pointA = 0;
				if ( isNaN( pointB ) ) pointB = 100;
				if ( unitA === 'px' ) pointA = convertPositionUnit( pointA );
				if ( unitB === 'px' ) pointB = convertPositionUnit( pointB );
				break;
			case 'radial':
				pointA = getRadialPosition( colorData[1] );
				pointB = getRadialPosition( colorData[2] );
				colorData[1] = `${ pointA }${ unitA }`;
				colorData[2] = `${ pointB }${ unitB }`;
				break;
			default:
				pointA = getConicPosition( colorData[1] );
				pointB = getConicPosition( colorData[2] );
				colorData[1] = `${ pointA }%`;
				colorData[2] = `${ pointB }%`;
		}

		if ( pointA < pointB ) {
			return [
				`${ colorData[0] } ${ colorData[1] }`, -1,
				`${ colorData[0] } ${ colorData[2] }`,
			];
		}
		return [
			`${ colorData[0] } ${ colorData[2] }`, -1,
			`${ colorData[0] } ${ colorData[1] }`,
		];
	} else if ( colorData.length === 2 ) {
		switch( type ) {
			case 'radial':
				const unit = colorData[1].search( '%' ) !== -1 ? '%' : 'px';
				return [ `${ colorData[0] } ${ getRadialPosition( colorData[1] ) }${ unit }` ];
			case 'conic':
				return [ `${ colorData[0] } ${ getConicPosition( colorData[1] ) }%` ];	
		}
		const point = parseInt( colorData[1].replace( /%|px/g, '' ), 10 );
		if ( isNaN( point ) ) {
			return [ colorData[0] ];
		}
	}

	return [ colorData.join( ' ' ) ];
}

const sortByPosition = ( items, colors ) => {
	items.sort( ( itmA, itmB ) => {
		let { position: posA } = itmA;
		let { position: posB } = itmB;
		
		if ( colors ) {
			const { unit: unitA } = itmA;
			const { unit: unitB } = itmB;
			if ( unitA === 'px' ) {
				posA = convertPositionUnit( posA );
			}
			if ( unitB === 'px' ) {
				posB = convertPositionUnit( posB );
			}
		}
		return posA >= posB ? 1 : -1;
	} );
};

const minPositionPoints = colors => {
	let prevColor = colors[0];
	const { length } = colors;
	
	for( let i = 1; i < length; i++ ) {
		const curColor = colors[i];
		let { position: prevPos, unit: prevUnit } = prevColor;
		let { position: curPos, unit: curUnit } = curColor;
		let unitConverted;
		let posA;
		let posB;
		
		if ( prevUnit === '%' ) {
			posA = prevPos;
		} else {
			posA = convertPositionUnit( prevPos );
		}
		if ( curUnit === '%' ) {
			posB = curPos;
		} else {
			unitConverted = true;
			posB = convertPositionUnit( curPos );
		}
		
		let position = Math.max( posA, posB );
		if ( unitConverted ) {
			position = convertPositionUnit( position, true );
		}
		
		curColor.position = position;
		prevColor = colors[i];
	}
};

const sortHints = colors => {
	if ( ! isNaN( colors[0]) ) colors.shift();
	if ( ! isNaN( colors[colors.length - 1] ) ) colors.pop();
	return colors.filter( ( color, index ) => ! ( ! isNaN( color ) && ! isNaN( colors[index + 1] ) ) ) ;
};

const addHints = clrs => {
	const colors = [];
	const { length } = clrs;
	let count;
	
	for( let i = 0 ; i < length; i+= count ) {
		const curColor = clrs[i];
		const nextColor = clrs[i + 1];
		count = 1;
		
		if( isNaN( parseInt( curColor, 10 ) ) ) {
			colors.push( curColor );
		}
		if ( nextColor !== undefined ) {
			const parsed = parseInt( nextColor, 10 );
			if ( isNaN( parsed ) ) {
				colors.push( -1 );
			} else {
				colors.push( minMax( 0, 100, parseFloat( nextColor ) ) );
				count = 2;
			}
		}
	}
	return sortHints( colors );
};

const calculateHints = ( colors, hints ) => {
	return hints.map( ( hint, index ) => {
		const startColor = colors[ index ];
		const nextColor = colors[ index + 1 ];
		
		let { unit: unitOne, position: posOne } = startColor;
		let { unit: unitTwo, position: posTwo } = nextColor;
		if ( unitOne === 'px' ) {
			posOne = convertPositionUnit( posOne );
		}
		if ( unitTwo === 'px' ) {
			posTwo = convertPositionUnit( posTwo );
		}
		
		const minPos = Math.min( posOne, posTwo );
		const maxPos = Math.max( posOne, posTwo );
		const difPos = maxPos - minPos;
		
		if ( hint !== -1 ) {
			const position = Math.max( minPos, Math.min( hint, maxPos ) );
			let percentage = ( ( position - minPos ) / difPos ) * 100;
			if ( isNaN( percentage ) ) {
				percentage = 50;
			}	
			return { percentage, position };
		}
		
		return {
			position: minPos + toFixed( difPos * 0.5 ),
			percentage: 50,
		};
	} );
};

const getGradientColors = ( clrs, type ) => {
	const conic = type === 'conic';
	let colors = clrs.map( color => verifyGradColor( color, conic ) );
	colors = addHints( colors );
	
	if ( colors.length === 1 ) {
		const secondColor = colors[0].split( ' ' );
		colors.push( -1 );
		colors.push( `${ secondColor[0] } 100%` );
	}
	
	let list = [];
	colors.forEach( color => {
		list = list.concat( formatGradientPositions( color, type ) );
	} );

	const colorList = getGradientColorData( list.filter( color => isNaN( color ) ) );
	const hints = calculateHints( colorList, list.filter( hint => ! isNaN( hint ) ) );
	
	return { 
		hints,
		colors: colorList,
	};
};

const createGradientColorsArray = gradient => {
	const colors = [];
	const { length } = gradient;
	
	let start;
	let index = 0;
	
	for ( let i = 0; i < length; i++ ) {
		const chr = gradient[i];

		if ( ! start && chr === ',' ) {
			let color = gradient.slice( index, i );
			const pos = color.search( /\)/ );
			
			if ( color.charAt( 0 ) === ',' ) {
				color = color.replace( ',', '' );
			} 
			if ( pos !== -1 && pos !== color.length - 1 ) {
				color = color.replace( ')', ') ' );
			}

			colors.push( color );
			index = i;
		}
		else if ( chr === '(' ) {
			start = true;
		} else if ( chr === ')' ) {
			start = false;
		}
	}
	
	colors.push( gradient.slice( index, length ).slice( 1 ) );
	return colors;
};

const filterEmpties = colors => {
	return colors.filter( color => color.replace(/  +/g, ' ').trim() );
};

const gradientObject = gradient => {
	let grad = gradient.split( '(' );
	
	if ( grad.length < 2 ) {
		return defaultGradient();
	}
	
	const type = grad[0].search( 'radial' ) !== -1 ? 'radial' : 
				 grad[0].search( 'conic' ) !== -1 ? 'conic' : 'linear';
				 
	const repeating = grad[0].search( 
		/repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient/
	) !== -1;
				 
	grad.shift();
	if ( ! grad.length ) {
		return defaultGradient();
	}
	
	let data;
	grad = grad.join( '(' ).split( ',' );
	const trimmed = grad[0].trim();
	
	if ( trimmed.search( colorRegExp ) === -1 && trimmed !== 'transparent' ) {
		data = getGradientData( type, grad[0] );
		grad.shift();
	} else {
		data = defaultGradient();
		if ( type === 'conic' ) {
			data.angle = 0;
		}
	}
	
	grad = grad.join( ',' ).replace( /\)$/, '' );
	grad = createGradientColorsArray( grad );
	grad = filterEmpties( grad );
	
	const { colors, hints } = getGradientColors( grad, type );
	if ( ! Array.isArray( colors ) || ! colors.length ) {
		colors = defGradientColors();
	}
	
	return {
		...defaultGradient(),
		...data,
		repeating,
		colors,
		hints,
		type, 
	};
}

const getGradients = grad => {
	const gradients = grad.split( /(,linear|,radial|,conic|,repeating)/ );
	const list = gradients.splice( 0, 1 );
	
	for( let i = 0; i < gradients.length; i += 2 ) {
		list.push( gradients[i] + gradients[i + 1] );
	}
	
	return list.map( gradient => gradientObject( gradient ) );
}

const getGradientObject = color => {
	let grad = color.replace( /;/g, '' ).trim();
	
	grad = trimItems( grad, [ ',', '(' ] );
	grad = grad.replace(/  +/g, ' ').replace( /\n/g, '' ).replace( /-webkit-|-moz-/, '' );

	return getGradients( grad );
};

const writeGradientColor = ( value, position, unit = '%' ) => {
	const color = cssColor( value );
	
	return {
		unit,
		color,
		value,
		position,
		opacity: value[3],
		hex: getRawHex( value ),
		rgb: value.slice( 0, 3 ),
		alphaChannel: value[3] < 1,
		preview: { background: color },
	};
};

export {
	sortByPosition,
	getGradientObject,
	writeGradientColor,
};
