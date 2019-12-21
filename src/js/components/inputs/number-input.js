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

class NumberInput extends PureComponent {
	constructor() {
		super( ...arguments );
		const { value } = this.props;
		this.state = { origValue: value };
	}
	
	onFocus = e => {
		const { target } = e;
		const { value } = target;
		this.setState( { origValue: parseInt( value, 10 ) } );
	};
	
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
	
	onMouseLeave = () => {
		this.updating = false;
		this.clearTimers();
	}
	
	onMouseUpBtn = () => {
		this.updating = false;
		this.clearTimers();
		const { value } = this.props;
		this.onChange( { target: { value } } );
	};
	
	onMouseEnter = () => {
		const {
			disabled,
			onMouseEnter,
			channel = 0,
		} = this.props;
		
		if ( onMouseEnter ) {
			onMouseEnter();
		}
		disabled( channel );
	}
	
	arrowUpClick = () => {
		this.onMouseDownBtn( true );
	}
	
	arrowDownClick = () => {
		this.onMouseDownBtn();
	}
	
	onSliderDown = () => {
		const { fetchRecords } = this.props;
		if ( fetchRecords ) {
			this.fetch = true;
		}
		this.updating = true;
	}
	
	onSliderUp = e => {
		this.fetch = false;
		this.updating = false;
		this.onChange( e );
	}
	
	clearTimers() {
		clearTimeout( this.timeout );
		clearInterval( this.timer );
	}
	
	componentWillUnmount() {
		this.clearTimers();
	}
	
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
	
	checkRecords( value ) {
		if ( ! this.records ) {
			this.setRecords( value );
		} else {
			return this.getRecords();
		}
		
		return null;
	}
	
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
