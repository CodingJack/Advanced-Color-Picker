// this number needs to equal the exact width of the preview strip
// a max is needed to translate pixel values visually in the editor's main strip
const maxPositionPixels = 800;

/*
 * @desc used to create two default color objects for newly added gradients
 * @since 1.0.0
*/
const defGradientColors = () => {
	return [ 
		{
			unit: '%',
			opacity: 0,
			position: 0,
			hex: '#000',
			color: 'rgba(0, 0, 0, 0)', 
			rgb: [0, 0, 0],
			value: [0, 0, 0, 0],
			preview: { background: 'transparent' },
		},
		{
			unit: '%',
			opacity: 1,
			position: 100,
			hex: '#000',
			color: '#000000', 
			rgb: [0, 0, 0],
			value: [0, 0, 0, 1],
			preview: { background: '#000' },
		}
	];
};

/*
 * @desc the default gradient data excluding colors and hints
 * @since 1.0.0
*/
const defaultGradient = () => {
	return {
		type: 'linear',
		angle: 180,
		shape: 'ellipse',
		extent: 'farthest-corner',
		repeating: false,
		hints: [],
		positions: { 
			x: { value: 50, unit: '%' }, 
			y: { value: 50, unit: '%' }, 
		},
		sizes: { 
			x: { value: 75, unit: '%' }, 
			y: { value: 75, unit: '%' }, 
		},
	}
};

/*
 * @desc used to create a default gradient object,
 * 		 new gradient data will then be pushed onto this object
 * @since 1.0.0
*/
const defaultEditorGradient = () => {
	return {
		...defaultGradient(),
		colors: defGradientColors(),
		hints: [ { position: 50, percentage: 50 } ],
	}
};

export {
	defaultGradient,
	defGradientColors,
	defaultEditorGradient,
	maxPositionPixels,
}