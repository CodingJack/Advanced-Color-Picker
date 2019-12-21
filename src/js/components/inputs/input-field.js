import React from 'react';
import NumberInput from './number-input';

import {
	AppContext,
} from '../../context';

import {
	isValidInput,
} from '../../utils/editor';

const {
	PureComponent,
} = React;

class InputField extends PureComponent {
	constructor() {
		super( ...arguments );
		const { value } = this.props;
		
		this.state = {
			value,
			isValid: true,
		};
	}
	
	onFocus = e => {
		const { target } = e;
		const { value: newValue } = target;
		this.setState( { origValue: parseInt( newValue, 10 ) } );
	};
	
	static getDerivedStateFromProps( props, state ) {
		const {
			isValid,
			value: stateValue,
		} = state;
		
		const { value: propValue } = props;
		const value = isValid ? propValue : stateValue;
		
		return { value };
	}
	
	onBlur = () => {
		const { isValid } = this.state;
		
		if( ! isValid ) {
			const { prop } = this.props;
			const { origValue } = this.state;
			const { onChange } = this.props;
			
			onChange( origValue, prop );
		}
	};
	
	onChange = ( value, updating, channel, records ) => {
		const {
			min = 0,
			max = 100,
		} = this.props;
		
		const isValid = isValidInput( value, min, max );
		
		this.setState( { value, isValid }, () => {
			if( isValid ) {
				const { onChange } = this.props;
				const { prop } = this.props;
				
				onChange( value, prop, updating, channel, records );
			}
		} );
	};
	
	render() {
		const { 
			prop,
			unit,
			label,
			slider,
			channel,
			disabled,
			inputRef,
			className,
			allValues,
			onMouseEnter,
			onMouseLeave,
			onChangeUnit,
			fetchRecords,
			sliderRecord,
			min = 0,
			max = 100,
			numbers = true,
			buttons = true,
		} = this.props;
		
		const { value } = this.state;
		
		return (
			<NumberInput 
				slug={ prop }
				label={ label }
				value={ value } 
				unit={ unit }
				min={ min }
				max={ max }
				channel={ channel }
				slider={ slider }
				buttons={ buttons }
				numbers={ numbers }
				disabled={ disabled }
				className={ className }
				allValues={ allValues }
				inputRef={ inputRef }
				onChange={ this.onChange } 
				onChangeUnit={ onChangeUnit }
				onMouseEnter={ onMouseEnter }
				onMouseLeave={ onMouseLeave }
				fetchRecords={ fetchRecords }
				sliderRecord={ sliderRecord }
			/>
		);
	}
};

InputField.contextType = AppContext;

export default InputField;
