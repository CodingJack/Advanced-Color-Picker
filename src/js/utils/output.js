import {
	toFixed,
	trimComma,
} from './utilities';

import {
	cssColor,
	reduceHex,
} from './colors';

import {
	defaultGradient,
} from '../data/defaults';

import {
	convertPositionUnit,
} from '../utils/utilities';

import {
	defaultSettings,
} from '../settings';


const gradientColor = ( gradColor, hint, conic ) => {
	const {
		unit,
		opacity,
		position,
		color: colorValue,
	} = gradColor;
	
	const color = opacity !== 0 ? colorValue : 'transparent';
	let clr = `${ reduceHex( color, true ) }`;
	
	if ( position !== -1 ) {
		if ( ! conic ) {
			const pos = unit === '%' ? toFixed( position ) : Math.round( position );
			clr += ` ${ pos }${ unit }`;
		} else {
			const pos = unit === '%' ? position : convertPositionUnit( position );
			const angle = Math.round( ( pos * 0.01 ) * 360 );
			clr += ` ${ angle }deg`;
		}
	}
	clr += ',';
	
	if ( hint !== undefined ) {
		const { percentage } = hint;
		if ( percentage !== 50 ) {
			const { position: hintPosition } = hint;
			return [ clr, `${ toFixed( hintPosition ) }%,` ];
		}
	}

	return [ clr ];
}

const shrinkOuput = colors => {
	const { length } = colors;
	
	let prevColor = trimComma( colors[0] );
	const newColors = [ `${ prevColor },` ];
	const { multiStops } = defaultSettings;
	
	for ( let i = 1; i < length; i++ ) {
		let curColor = trimComma( colors[i] );
		if ( multiStops ) {
			const clrA = prevColor.split( ' ' );
			const clrB = curColor.split( ' ' );
			
			if ( clrA[0] === clrB[0] && clrA.length > 1 && clrB.length > 1 ) {
				if ( i + 1 < length ) {
					const nextColor = trimComma( colors[i + 1] );
					if ( clrA[0] === nextColor.split( ' ' )[0] ) {
						continue;
					}
				}
				curColor = `${ clrB[0] } ${ trimComma( clrA[1], ',' ) } ${ clrB[1] }`;
				newColors.pop();
			}
			prevColor = curColor;
		}
		newColors.push( `${ curColor },` );
	}
	
	const firstColor = newColors[0];
	const lastColor = newColors[newColors.length - 1];
	const firstPos = firstColor.split( ' ' );
	const lastPos = lastColor.split( ' ' );
	
	if ( firstPos.length === 2 && parseInt( firstPos[1], 10 ) === 0 ) {
		newColors[0] = `${ firstPos[0] },`;
	}
	if ( lastPos.length === 2 ) {
		const max = lastPos[1].search( 'deg' ) === -1 ? 100 : 360;
		const pos = parseInt( lastPos[1], 10 );
		if ( pos === max ) {
			newColors[newColors.length - 1] = `${ lastPos[0] },`;
		}
	}
	
	return newColors;
};

const trimPositions = ( clrs, hints ) => {
	if( ! hints.every( hint => {
		if ( hint === undefined ) {
			return true;
		}
		const { percentage } = hint;
		return percentage === 50 || percentage === -1;
	} ) ) {
		return clrs;
	}
	
	const { length } = clrs;
	const total = length - 1;
	const { position: startPos, unit: firstUnit } = clrs[0];
	const { position: endPos, unit: lastUnit } = clrs[ total ];
	let lastPos = lastUnit === '%' ? endPos : convertPositionUnit( endPos );
	
	if( startPos > 0 || lastPos < 100 || firstUnit === 'px' || lastUnit === 'px' ) {
		return clrs;
	}
	
	const perc = toFixed( ( 1 / total ) * 100 );
	let curPos = perc;
	
	for( let j = 1; j < total; j++ ) {
		const { color, position, unit } = clrs[j];
		if ( unit === 'px' ) {
			return clrs;
		}
		const { color: prevColor } = clrs[j - 1];
		const { color: nextColor } = clrs[j + 1];
		if ( position !== curPos || color === prevColor || color === nextColor ) {
			return clrs;
		}
		curPos += perc;
	}
	
	return clrs.map( color => {
		return { ...color, position: -1 };
	} );
};

const reduceHints = ( colors, hints ) => {
	return hints.map( ( hint, index ) => {
		const prevColor = colors[ index ];
		const nextColor = colors[ index + 1 ];
		const { color: startColor } = prevColor;
		const { color: endColor } = nextColor;
		
		if ( startColor !== endColor ) {
			return hint;
		}
		return undefined;
	} );
};

const buildColors = ( gradColors, hints, conic ) => {
	const reducedHints = reduceHints( gradColors, hints ); 
	const clrs = trimPositions( gradColors, reducedHints ).map( ( color, index ) => {
		return gradientColor( color, reducedHints[ index ], conic );
	} );
	
	let colors = [];
	clrs.forEach( color => ( colors = colors.concat( color ) ) );
	return shrinkOuput( colors ).join( ' ' ).slice( 0, -1 );
};

const conicGradient = grad => {
	const {
		hints,
		angle: gradAngle,
		colors: gradColors,
		positions: gradPositions,
		repeating: gradRepeating,
	} = grad;
	
	const { x, y } = gradPositions;
	const { value: valueX, unit: unitX } = x;
	const { value: valueY, unit: unitY } = y;
	const defaultX = valueX === 50 && unitX === '%';
	const defaultY = valueY === 50 && unitY === '%';
	const hasAngle = gradAngle !== 0 && gradAngle !== 360;
	
	let positions = '';
	let prefix = '';
	
	if ( ! defaultX || ! defaultY ) {
		if ( defaultY && unitX === '%' ) {
			positions = `at ${ toFixed( valueX ) }%`;
		} else {
			positions = `at ${ toFixed( valueX ) }${ unitX } ${ toFixed( valueY ) }${ unitY }`;
		}
	}
	if ( hasAngle ) {
		prefix = `from ${ gradAngle }deg`;
	}
	if ( positions ) {
		if ( prefix ) {
			prefix += ' ';
		}
		prefix += `${ positions }`;
	}
	if ( prefix ) {
		prefix += ', ';
	}

	const repeating = ! gradRepeating ? '' : 'repeating-';
	const colors = buildColors( gradColors, hints, true );
	
	return `${ repeating }conic-gradient(${ prefix }${ colors })`;
};

const radialGradient = grad => {
	const {
		hints,
		sizes,
		positions,
		colors: gradColors,
		shape: radialShape,
		extent: radialExtent,
		repeating: gradRepeating,
	} = grad;
	
	let extent;
	let shape;
	
	if ( radialShape !== 'size' ) {
		shape = radialShape === 'ellipse' ? '' : 'circle';
		extent = radialExtent === 'farthest-corner' ? '' : ` ${ radialExtent }`;
	} else {
		const { x: width, y: height } = sizes;
		const { value: widthValue, unit: widthUnit } = width;
		const { value: heightValue, unit: heightUnit } = height;
		if ( widthUnit === 'px' && heightUnit === 'px' && widthValue === heightValue ) {
			extent = ` ${ widthValue }px`;
		} else {
			extent = ` ${ widthValue }${ widthUnit } ${ heightValue }${ heightUnit }`;
		}
		shape = '';
	}
	
	const repeating = ! gradRepeating ? '' : 'repeating-';
	const colors = buildColors( gradColors, hints );
	const { x: posX, y: posY } = positions;
	
	const { value: posXValue, unit: posXUnit } = posX;
	const { value: posYValue, unit: posYUnit } = posY;
	
	const defaultX = posXValue === 50 && posXUnit === '%';
	const defaultY = posYValue === 50 && posYUnit === '%';
	
	if ( ! shape && extent ) {
		extent = extent.slice( 1 );
	}
	let gradient = `radial-gradient(${ shape }${ extent }`;
	
	if ( ! defaultX || ! defaultY ) {
		if ( shape || extent ) {
			gradient += ' ';
		}
		if ( defaultY && posXUnit === '%' ) {
			gradient += `at ${ toFixed( posXValue ) }%, `;
		} else {
			gradient += `at ${ toFixed( posXValue ) }${ posXUnit } ${ toFixed( posYValue ) }${ posYUnit }, `;
		}
	} else {
		if (shape || extent ) {
			gradient += ', ';
		}
	}
	
	return `${ repeating }${ gradient }${ colors })`;
};

const linearGradient = grad => {
	const {
		hints,
		angle: gradAngle,
		colors: gradColors,
		repeating: gradRepeating,
	} = grad;

	const repeating = ! gradRepeating ? '' : 'repeating-';
	const colors = buildColors( gradColors, hints );
	const angle = gradAngle !== 180 ? `${ gradAngle }deg, ` : '';

	return `${ repeating }linear-gradient(${ angle }${ colors })`;
};

const allColorsEqual = gradients => {
	return ! gradients.filter( gradient => {
		const { colors } = gradient;
		const { color: firstColor } = colors[0];
		return ! colors.every( obj => obj.color === firstColor );
	} ).length;
};

const cssGradient = ( 
	currentGradients,
	currentMode,  
	selectedColor = 0,
	selectedGradient = 0,
) => {
	let gradients = currentGradients;
	
	if ( currentMode === 'color' || allColorsEqual( gradients ) ) {
		return cssColor( gradients[ selectedGradient ].colors[ selectedColor ].color );
	} else if( currentMode === 'single_gradient' ) {
		gradients = [ gradients[ selectedGradient ] ];
	}
	
	let grad = '';
	gradients.forEach( ( gradient, index ) => {
		if ( index > 0 ) {
			grad += ', ';
		}
		
		const { type } = gradient;
		switch( type ) {
			case 'linear':
				grad += linearGradient( gradient );	
				break;
			case 'radial':
				grad += radialGradient( gradient );
				break;
			default:
				grad += conicGradient( gradient );
		}
	} );

	return grad;
};

const buildGradientStrip = ( 
	colors, 
	hints, 
	currentMode, 
	selectedColor = 0, 
) => {
	return cssGradient( [ {
		...defaultGradient(),
		angle: 90,
		colors: colors.slice().map( color => {
			return { ...color };
		} ),
		hints,
	} ], currentMode, selectedColor ); 
};

export {
	cssGradient,
	buildGradientStrip,
}
