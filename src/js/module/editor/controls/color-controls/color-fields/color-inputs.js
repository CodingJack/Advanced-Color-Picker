import React from 'react';
import InputField from '../../../../../components/inputs/input-field';

import {
	AppContext,
} from '../../../../../context';

const {
	Component,
} = React;

const inputs = {
	rgb: [ 
		{ label: 'Red', max: 255 },
		{ label: 'Green', max: 255 },
		{ label: 'Blue', max: 255 },
	],
	hsl: [ 
		{ label: 'Hue', max: 359 },
		{ label: 'Saturation' },
		{ label: 'Lightness' },
	],
}

const lightnessRecord = { 
	minMax: [0, 100],
	records: [0, 1],
};

const saturationRecord = { 
	minMax: [0, 100],
	records: [0],
};

const rgbDisabled = [ false, false, false ];

const updateRecords = ( slicedValue, records ) => {
	records.forEach( record => {
		const { index, value } = record;
		slicedValue[ index ] = value;
	} );
};

class ColorInputs extends Component {
	constructor() {
		super( ...arguments );
	}
	
	onChange = ( newValue, prop, updating, channel, records ) => {
		const {
			type,
			value,
			onChange,
		} = this.props;
		
		const slicedValue = value.slice();
		
		if ( records ) {
			updateRecords( slicedValue, records );
		}
		
		slicedValue[ channel ] = newValue;
		onChange( slicedValue, type, updating );
	};
	
	render() {
		const { 
			type, 
			value,
		} = this.props;
		
		let disabled;
		if( type === 'rgb' ) {
			disabled = rgbDisabled;
		} else {
			disabled = [ value[1] === 0, value[2] === 0 || value[2] === 100, false ];
		}
		
		return (
			inputs[ type ].map( ( input, index ) => {
				const { label, min, max } = input;
				const isDisabled = disabled[ index ];
				
				let fetchRecords;
				let sliderMinMax;
				
				if ( type === 'hsl' && index > 0 ) {
					fetchRecords = true;
					sliderMinMax = index === 1 ? saturationRecord : lightnessRecord;
				} else {
					fetchRecords = false;
				}
				
				return (
					<InputField 
						slider
						key={ `${ type }-${ index }` }
						prop={ type }
						label={ label }
						channel={ index }
						min={ min }
						max={ max }
						allValues={ value }
						value={ value[ index ] } 
						onChange={ this.onChange } 
						disabled={ isDisabled }
						fetchRecords={ fetchRecords }
						sliderRecord={ sliderMinMax }
					/>
				);
			} )
		);
	}
}

ColorInputs.contextType = AppContext;

export default ColorInputs;