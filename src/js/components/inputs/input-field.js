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

/*
 * @desc used manage the state of all number inputs
 *       as an input field could have an empty or invalid value
 *       which then needs to be controlled internally
 * @since 1.0.0
*/
class InputField extends PureComponent {
	constructor() {
		super( ...arguments );
		const { value } = this.props;
		
		this.state = {
			value,
			isValid: true,
		};
	}
	
	/*
	 * @desc caches the original value before a change begins
	 * @since 1.0.0
	*/
	onFocus = e => {
		const { target } = e;
		const { value: newValue } = target;
		this.setState( { origValue: parseInt( newValue, 10 ) } );
	};
	
	/*
	 * @desc if the current input is invalid it will retain its invalid state until it becomes valid again
	 *       this allows for "empty" inputs, i.e. allowing the user to erase everything 
	 *       in the input field before typing in a new value
	 *       otherwise the value will simply default to its prop value
	 * @since 1.0.0
	*/
	static getDerivedStateFromProps( props, state ) {
		const {
			isValid,
			value: stateValue,
		} = state;
		
		const { value: propValue } = props;
		const value = isValid ? propValue : stateValue;
		
		return { value };
	}
	
	/*
	 * @desc possibly reset the value to what it was originally if the new value is invalid
	 * @since 1.0.0
	*/
	onBlur = () => {
		const { isValid } = this.state;
		
		if( ! isValid ) {
			const { prop } = this.props;
			const { origValue } = this.state;
			const { onChange } = this.props;
			
			onChange( origValue, prop );
		}
	};
	
	/*
	 * @desc fires whenever a change occurs, only kicking up the change above if the changed value is valid
	 * @since 1.0.0
	*/
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
