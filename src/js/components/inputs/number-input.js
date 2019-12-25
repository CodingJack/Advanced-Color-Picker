/*
 * A note on "Records":
 * as an "h", "s" or "l" value changes, the official color could turn black or white,
 * ... subsequently changing the values of the adjacent inputs as the user is dragging the range slider
 * but since this may not be the indended final change (as the user may still be dragging the slider),
 * the adjacent values "spring back" to their original values if the slider does not officially end on a "global change" point (black or white)
 * For example, changing "lightness" to "0" or "100" would subsequently change the "h" and "l" values to "0",
 * but if the user drags the "lightness" back to a non black/white value (anything between 0 and 100, and BEFORE mousing up on the slider),
 * the "h" and "l" values would be returned to their original values, whatever they were before the slider dragging began.
 * this essentially prevents the user from "losing" their original color by accident as the hsl values are adjusted via the range slider
*/

import React from 'react';
import SelectBox from '../select-box';
import RangeSlider from '../sliders/range-slider';
import InputWrap from '../wrappers/input-wrap';
import RangeButtons from '../buttons/range-buttons';
import Row from '../wrappers/row';

import {
	AppContext,
} from '../../context';

import {
	isValidInput,
} from '../../utils/editor';

const {
	PureComponent,
} = React;

const defaultIcons = [ 
	'arrow_drop_up', 
	'arrow_drop_down'
];

const unitList = {
	'%': { label: '%' },
	'px': { label: 'px' },
};

/*
 * @desc used to manage the state of all number-based inputs
 * 		 as input could be completely empty, the official value is only changed when the value is valid
 * @since 1.0.0
*/
class NumberInput extends PureComponent {
	constructor() {
		super( ...arguments );
		const { value } = this.props;
		this.state = { origValue: value };
	}
	
	/*
	 * @desc cache the original value before changes begin
	 * @since 1.0.0
	*/
	onFocus = e => {
		const { target } = e;
		const { value } = target;
		this.setState( { origValue: parseInt( value, 10 ) } );
	};
	
	/*
	 * @desc reset the input to its original value if the changes are invalid
	 * @since 1.0.0
	*/
	onBlur = e => {
		const { 
			min = 0,
			max = 100,
		} = this.props;
		
		const { target } = e;
		const { value } = target;
		
		if( ! isValidInput( value, min, max ) ) {
			const {
				onChange,
				channel = 0,
			} = this.props;
			
			const { origValue } = this.state;
			onChange( origValue, false, channel );
		}
	};
	
	/*
	 * @desc the up/down arrows have been pressed
	 * @since 1.0.0
	*/
	onMouseDownBtn = up => {
		let run;
		this.updating = true;
		this.increment( up );
		
		this.timeout = setTimeout( () => {
			this.timer = setInterval( () => {
				run = this.increment( up );
				if( ! run ) {
					this.onMouseUpBtn();
				}
			}, 50);
		}, 100 );
	};
	
	/*
	 * @desc stop incrementing if the arrows are no longer hovered
	 * @since 1.0.0
	*/
	onMouseLeave = () => {
		this.updating = false;
		this.clearTimers();
	}
	
	/*
	 * @desc stop incrementing if the arrows are no longer pressed
	 *       also called each time the increment timer runs
	 * @since 1.0.0
	*/
	onMouseUpBtn = () => {
		this.updating = false;
		this.clearTimers();
		const { value } = this.props;
		this.onChange( { target: { value } } );
	};
	
	/*
	 * @desc increment the value up
	 * @since 1.0.0
	*/
	arrowUpClick = () => {
		this.onMouseDownBtn( true );
	}
	
	/*
	 * @desc increment the value down
	 * @since 1.0.0
	*/
	arrowDownClick = () => {
		this.onMouseDownBtn();
	}
	
	/*
	 * @desc input slider changes potentially starting
	 *       see "Records" note above
	 * @since 1.0.0
	*/
	onSliderDown = () => {
		const { fetchRecords } = this.props;
		if ( fetchRecords ) {
			this.fetch = true;
		}
		this.updating = true;
	}
	
	/*
	 * @desc user has finished dragging the range slider control
	 * @since 1.0.0
	*/
	onSliderUp = e => {
		this.fetch = false;
		this.updating = false;
		this.onChange( e );
	}
	
	
	/*
	 * @desc clears number input incrementing timers when changing is complete
	 * @since 1.0.0
	*/
	clearTimers() {
		clearTimeout( this.timeout );
		clearInterval( this.timer );
	}
	
	componentWillUnmount() {
		this.clearTimers();
	}
	
	/*
	 * @desc increment the value up or down as the fake input number buttons are clicked
	 * @since 1.0.0
	*/
	increment = up => {
		const { 
			value,
			min = 0,
			max = 100,
		} = this.props;
		
		let newValue = up ? value + 1 : value - 1;
		newValue = Math.round( newValue );
		
		if( newValue >= min && newValue <= max ) {
			this.onChange( { target: { value: newValue } } );
			return true;
		}
		
		return false;
	};
	
	/*
	 * @desc gets a copy of the current values for the hsl inputs
	 *       see "Records" note above
	 * @since 1.0.0
	*/
	getRecords() {
		const { sliderRecord } = this.props;
		const { records } = sliderRecord;
		const passedRecords = [];
		
		records.forEach( index => {
			passedRecords.push( { 
				index, 
				value: parseInt( this.records[index], 10 ),
			} );
		} );
		
		this.records = null;
		return passedRecords;
	}
	
	/*
	 * @desc creates a copy of the current values for the hsl inputs
	 *       see "Records" note above
	 * @since 1.0.0
	*/
	setRecords( value ) {
		const { sliderRecord } = this.props;
		const { minMax } = sliderRecord;
		
		if ( minMax.includes( value ) ) {
			const { allValues } = this.props;
			const { records } = sliderRecord;
			const recordValues = [];
			
			records.forEach( index => {
				recordValues[ index ] = allValues[ index ];
			} );
			
			this.records = recordValues;
		}
	}
	
	/*
	 * @desc checks if the records need to be reset after a change happens
	 *       see "Records" note above
	 * @since 1.0.0
	*/
	checkRecords( value ) {
		if ( ! this.records ) {
			this.setRecords( value );
		} else {
			return this.getRecords();
		}
		
		return null;
	}
	
	/*
	 * @desc fires after the slider has been dragged, an ioncrement arrow is clicked or via direct input
	 * @since 1.0.0
	*/
	onChange = e => {
		const {
			onChange,
			channel = 0,
		} = this.props;
		
		let records;
		const { target } = e;
		const { value: newValue } = target;
		const clampedValue = newValue !== '' ? parseInt( newValue, 10 ) : newValue;
		
		if ( this.fetch ) {
			records = this.checkRecords( clampedValue );
		}

		onChange( clampedValue, this.updating, channel, records );
	};
	
	render() {
		const {
			slug,
			unit,
			label,
			value,
			slider,
			disabled,
			inputRef,
			onChangeUnit,
			onMouseLeave,
			onMouseEnter,
			min = 0,
			max = 100,
			channel = 0,
			numbers = true,
			buttons = true,
			className = '',
			arrowIcons = defaultIcons,
		} = this.props;
		
		const { namespace } = this.context;
		const id = `${ namespace }-${ slug }-input-${ channel }`;
		
		// if "disabled" exists it could be a number which could be 0
		const isDisabled = disabled !== undefined && disabled !== null && disabled !== false;
		
		let extraClass = ! className ? '' : `${ className }`;
		if ( isDisabled ) {
			if ( extraClass ) {
				extraClass += ' ';
			}
			extraClass += `${ namespace }-disabled`;
		}
		
		let parsed = value;
		if ( value !== '' ) {
			parsed = Math.round( parseFloat( value ) );
		} else {
			parsed = value;
		}
		
		return (
			<Row 
				ref={ inputRef }
				onMouseEnter={ onMouseEnter } 
				onMouseLeave={ onMouseLeave } 
				className={ `${ extraClass }` }
			>
				{ numbers && (
					<InputWrap>
						<input 
							id={ id }
							className={ `${ namespace }-input` }
							type="number"
							min={ min }
							max={ max }
							disabled={ isDisabled }
							value={ parsed } 
							onFocus={ this.onFocus }
							onBlur={ this.onBlur } 
							onChange={ this.onChange } 
						/>
						{ buttons && (
							<RangeButtons
								icons={ arrowIcons }
								arrowUpClick={ this.arrowUpClick }
								arrowDownClick={ this.arrowDownClick }
								onMouseLeave={ this.onMouseLeave }
								onMouseUp={ this.onMouseUpBtn }
							/>
						) }
					</InputWrap>
				) }
				{ slider && (
					<RangeSlider
						min={ min }
						max={ max }
						value={ parsed } 
						disabled={ isDisabled }
						onMouseDown={ this.onSliderDown }
						onMouseUp={ this.onSliderUp }
						onChange={ this.onChange } 
					/>
				) }
				{ label && (
					<label 
						className={ `${ namespace }-input-label` } 
						htmlFor={ id }
					>{ label }</label>
				) }
				{ unit && (
					<SelectBox 
						isMini
						prop={ slug }
						value={ unit }
						list={ unitList }
						onChange={ onChangeUnit }
					/>
				) }
			</Row>
		);
	}
};

NumberInput.contextType = AppContext;

export default NumberInput;
