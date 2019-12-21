import React from 'react';
import Wrapper from './wrappers/wrapper';
import InputWrap from './wrappers/input-wrap';
import Scrollable from '../hoc/scrollable';
import SelectColor from './select-box/select-color';
import Button from './buttons/button';
import Icon from './icon';

import {
	SortableItem,
	SortableWrapper,
	SortableHandler,
} from './wrappers/sortable';

import {
	AppContext,
} from '../context';

import {
	cssGradient,
} from '../utils/output';

const {
	Component,
	createRef,
} = React;

class SelectBox extends Component {
	constructor() {
		super( ...arguments );
		
		const { prop } = this.props;
		const { namespace } = this.context;
		
		this.selectRef = createRef();
		this.containerId = `${ namespace }-select-${ prop }-${ Math.round( Math.random() * 10000 ) }`;
	}
	
	state = {
		menuOpen: false,
		containerStyle: null,
	};
	
	onClick = ( val, index ) => {
		this.toggleListener();
		this.setState( {
			menuOpen: false,
			containerStyle: null,
		}, () => {
			const { onChange, prop, reverse } = this.props;
			let value = val;
			if ( reverse && ! isNaN( value ) ) {
				value = Math.abs( index - this.lastIndex );
			}
			onChange( value, prop, index );
		} );
	};
	
	openCloseMenu = () => {
		let isOpen;
		
		this.setState( prevState => {
			const { menuOpen } = prevState;
			isOpen = ! menuOpen;
			
			return {
				menuOpen: isOpen,
				containerStyle: isOpen ? { zIndex: 999 } : null,
			}
		}, () => {
			if ( isOpen ) {
				this.toggleListener( true );
			} else {
				this.toggleListener();
			}
		} );
	};
	
	closeMenu = e => {
		const { target } = e;
		if ( target.id === this.containerId || target.closest( `#${ this.containerId }` ) ) {
			return;
		}
		
		this.toggleListener();
		this.setState( {
			menuOpen: false,
			containerStyle: null,
		} );
	};
	
	toggleListener( addListener ) {
		const { root } = this.context;
		if ( ! addListener ) {
			root.removeEventListener( 'click', this.closeMenu );
		} else {
			root.addEventListener( 'click', this.closeMenu );
		}
	}
	
	onSortStart = () => {
		const { setCursor } = this.context;
		setCursor( 'move' );
	};
	
	onSortEnd = e => {
		const { oldIndex, newIndex } = e;
		const { onSwapItem, reverse } = this.props;
		const { setCursor } = this.context;
		setCursor();
		
		if ( ! reverse ) {
			onSwapItem( oldIndex, newIndex );
		} else {
			onSwapItem( 
				Math.abs( oldIndex - this.lastIndex ), 
				Math.abs( newIndex - this.lastIndex )
			);
		}
	};
	
	cycleItems = () => {
		const { 
			list, 
			prop, 
			value,
			onChange, 
		} = this.props;
		
		const keys = Object.keys( list );
		const index = keys.indexOf( value );
		const newIndex= index < keys.length - 1 ? index + 1 : 0;
		onChange( keys[ newIndex ], prop, newIndex );
	};
	
	componentWillUnmount() {
		this.toggleListener();
		this.selectRef = null;
	}
	
	render() {
		const {
			list, 
			value,
			label,
			isLong,
			onFocus, 
			onBlur, 
			pattern,
			preview,
			isSingle,
			className,
			inputValue,
			onSwapItem,
			cycleButtons,
			onInputChange, 
			currentLabel,
			currentPreview,
			input = false,
			isMini = false,
			maxScrollable = 9,
		} = this.props;
		
		const { menuOpen, containerStyle } = this.state;
		const { namespace } = this.context;
		const selectedItm = list[ value ];
		
		const { 
			icon: selectedIcon,
			label: selectedLabel, 
			iconStyle: selectedIconStyle,
		} = selectedItm;
		
		let extraClass = className ? ` ${ className }` : '';
		if ( isLong ) {
			extraClass += ` ${ namespace }-select-long`;
		}
		if ( isMini ) {
			extraClass += ` ${ namespace }-select-mini`;
		}
		
		const iconBtn = ! menuOpen ? 'arrow_drop_down' : 'arrow_drop_up';
		const keyList = Object.keys( list );
		const { length: listLength } = keyList;
		
		const canSwap = onSwapItem && listLength > 1 ? true : false;
		const scrollable = listLength > maxScrollable;
		const scrollClass = ! scrollable ? '' : ` ${ namespace }-select-scroll`;
		
		const toggleMenu = ! isSingle ? this.openCloseMenu : null;
		this.lastIndex = listLength - 1;
		
		return (
			<>
				<div 
					id={ this.containerId } 
					className={ `${ namespace }-select-container${ extraClass }` }
					style={ containerStyle }
				>
					<div 
						className={ `${ namespace }-select-wrap ${ namespace }-select-active` }
						onClick={ toggleMenu }
					>
						{ isMini && (
							<span className={ `${ namespace }-select-btn` }>
								<Icon type={ iconBtn } />
							</span>
						) }
						<span className={ `${ namespace }-select-option` }>
							{ preview && (
								<SelectColor 
									namespace={ namespace }
									style={ currentPreview } 
								/> 
							) }
							{ ! input && (
								<>
									{ selectedIcon && <Icon type={ selectedIcon } style={ selectedIconStyle } /> }
									{ currentLabel || selectedLabel }
								</>
							) }
							{ input && (
								<InputWrap>
									<input type="text"  
										className={ `${ namespace }-input` }
										value={ inputValue } 
										onFocus={ onFocus }
										onBlur={ onBlur }
										onChange={ onInputChange } 
										pattern={ pattern }
									/>
								</InputWrap>
							) }
						</span>
						{ ! isMini && (
							<span className={ `${ namespace }-select-btn` }>
								<Icon type={ iconBtn } />
							</span>
						) }
					</div>
					{ menuOpen && (
						<Wrapper
							wrapIt={ canSwap }
							wrapper={ children => (
								<SortableWrapper 
									useDragHandle={ true }
									onSortEnd={ this.onSortEnd } 
									updateBeforeSortStart={ this.onSortStart }
									helperContainer={ () => this.selectRef.current }
								>{ children }</SortableWrapper>
							) }
						>
							<div className={ `${ namespace }-select-options${ scrollClass }` } ref={ this.selectRef }>
								<Wrapper
									wrapIt={ scrollable }
									wrapper={ children => <Scrollable>{ children }</Scrollable> }
								>
								{
									keyList.map( ( key, index ) => {
										const selectedClass = key !== value.toString() ? '' : ` ${ namespace }-selected-option`;
										const activePreset = ! selectedClass ? '' : ` ${ namespace }-preset-active`;
										const itm = list[ key ];
										const { label, preview, icon, iconStyle } = itm;
										
										let itmPreview;
										if ( preview ) {
											if ( typeof preview === 'string' ) {
												itmPreview = { background: preview };
											} else {
												itmPreview = { background: cssGradient( [ preview ] ) };
											}
										}
										
										return (
											<Wrapper
												key={ `${ namespace }-select-option-${ index }` } 
												wrapIt={ canSwap }
												wrapper={ children => <SortableItem index={ index }>{ children }</SortableItem> }
											>
												<div 
													className={ `${ namespace }-select-wrap${ selectedClass }` }
													onClick={ () => this.onClick( key, index ) }
												>
													<span className={ `${ namespace }-select-option` }>
														{ preview && (
															<SelectColor 
																style={ itmPreview } 
																namespace={ namespace }
																className={ activePreset } /> 
														) }
														{ icon && <Icon type={ icon } style={ iconStyle } /> }
														{ label }
													</span>
													{ canSwap && (
														<SortableHandler>
															<span 
																className={ `${ namespace }-select-btn ${ namespace }-select-swap` }
																onMouseDown={ e => e.preventDefault() }
															>
																<Icon type="swap_vert" />
															</span>
														</SortableHandler>
													) }
												</div>
											</Wrapper>
										);
									} )
								}
								</Wrapper>
							</div>
						</Wrapper>
					) }
				</div>
				{ cycleButtons && (
					<span className="cj-color-cycle-arrows">
						<Button 
							icon="arrow_right" 
							className={ `${ namespace }-select-btn` }
							onClick={ this.cycleItems } 
						/>
					</span>
				) }
				{ label && (
					<label 
						className={ `${ namespace }-input-label` } 
						htmlFor={ this.containerId }
					>{ label }</label>
				) }
			</>
		);
	}
}

SelectBox.contextType = AppContext;

export default SelectBox;