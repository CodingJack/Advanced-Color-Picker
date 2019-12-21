// this number needs to equal the exact width of the preview strip
const maxPositionPixels = 800;

const defGradientColors = () => {
	return [ 
		{
			unit: '%',
			opacity: 1,
			position: 0,
			hex: '#fff',
			color: '#FFFFFF', 
			alphaChannel: false,
			rgb: [255, 255, 255],
			value: [255, 255, 255, 1],
			preview: { background: '#fff' },
		},
		{
			unit: '%',
			opacity: 1,
			position: 100,
			hex: '#000',
			color: '#000000', 
			alphaChannel: false,
			rgb: [0, 0, 0],
			value: [0, 0, 0, 1],
			preview: { background: '#000' },
		}
	];
};

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