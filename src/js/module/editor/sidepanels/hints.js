import React from 'react';
import HintPair from './hints/hint-pair';
import InputField from '../../../components/inputs/input-field';
import Button from '../../../components/buttons/button';
import Wrapper from '../../../components/wrappers/wrapper';
import Scrollable from '../../../hoc/scrollable';

import {
	EditorContext,
} from '../../../context';

import {
	withAppContext,
} from '../../../hoc/with-context';

const {
	Component,
} = React;

class Hints extends Component {
	constructor() {
		super( ...arguments );
	}
	
	onChange = ( value, index, updating ) => {
		this.updating = updating;
		const { onChangeHintPercentage } = this.context;
		onChangeHintPercentage( value, index, updating );
	}
	
	hideHint = () => {
		if ( ! this.updating ) {
			const { showHideHint } = this.context;
			showHideHint( -1 );
		}
	};
	
	render() {
		const { 
			colors, 
			currentMode,
			showHideHint,
			onReverseGradient,
			hints: colorHints,
		} = this.context;
		
		const { appContext, minPairs = 3 } = this.props;
		const { namespace } = appContext;
		
		const allHints = currentMode !== 'color' ? colorHints : [];
		const hints = allHints.slice();
		
		while( hints.length < minPairs ) {
			hints.push( null );
		}
		
		const { length: pairLength } = hints;
		const scrollable = pairLength > minPairs;
		const reverseDisabled = currentMode === 'color';
		
		return (
			<>
				<div className={ `${ namespace }-pairs` } onMouseLeave={ this.hideHint }>
					<Wrapper
						wrapIt={ scrollable }
						wrapper={ children => <Scrollable>{ children }</Scrollable> }
					>
					{
						hints.map( ( hint, index ) => {
							let blank;
							let startStyle;
							let endStyle;
							let percentage;
							let onMouseLeave;
							let className = '';
							let disabledClass = '';
							
							const lastRow = index === pairLength - 1;
							let extraClass = ! lastRow ? '' : ` ${ namespace }-pair-last`;
							
							if ( hint !== null ) {
								const start = colors[ index ];
								const end = colors[ index + 1 ];
								
								const { 
									unit: startUnit,
									color: startColor, 
									position: startPos,
									preview: startPreview,
								} = start;
								
								const { 
									unit: endUnit,
									color: endColor, 
									position: endPos,
									preview: endPreview,
								} = end;
								
								const posEquals = startPos === endPos && startUnit === endUnit;
								if ( posEquals || startColor === endColor ) {
									disabledClass = ` ${ namespace }-disabled`;
									onMouseLeave = this.hideHint;
								}
								
								const currentHint = hints[ index ];
								const { percentage: hintPercentage } = currentHint;
								
								percentage = hintPercentage;
								startStyle = startPreview;
								endStyle = endPreview;

							} else {
								blank = true;
								disabledClass = ` ${ namespace }-disabled`;
								className = ` ${ namespace }-preset-blank`;
								onMouseLeave = this.hideHint;
								percentage = 50;
							}
							
							return (
								<div 
									key={ `${ namespace }-pair-${ index }` } 
									className={ `${ namespace }-pair${ extraClass }` }
									onMouseEnter={ onMouseLeave }
								>
									<div 
										className={ `${ namespace }-pair-inner${ disabledClass }` }
										onMouseEnter={ () => showHideHint( index ) }
									>
										<HintPair 
											blank={ blank }
											className={ className } 
											style={ startStyle } 
										/>
										<InputField 
											slider 
											prop={ index }
											numbers={ false }
											value={ percentage }
											onChange={ this.onChange }
										/>
										<HintPair 
											blank={ blank }
											className={ className } 
											style={ endStyle } 
										/>
									</div>
								</div>
							);
						} )
					}
					</Wrapper>
				</div>
				<div className={ `${ namespace }-pair-btns` }>
					<Button 
						type="long"
						label="Reverse Positions"
						disabled={ reverseDisabled } 
						onClick={ onReverseGradient }
					/>
				</div>
			</>
		);
	}
}

Hints.contextType = EditorContext;

export default withAppContext( Hints );
