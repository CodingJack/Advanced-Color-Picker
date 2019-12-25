import React from 'react';
import ColorPoint from './strip/color-point';
import HintPoint from './strip/hint-point';

import {
	EditorContext,
} from '../../../context';

import {
	withAppContext,
} from '../../../hoc/with-context';

const {
	Component,
	createRef,
} = React;

/*
 * @desc the horizontal linear-gradient strip used to manage color point positions and also show hint tooltip percentages
 * @since 1.0.0
*/
class Strip extends Component {
	constructor() {
		super( ...arguments );
		this.stripRef = createRef();
	}
	
	/*
	 * @desc add a new color to the current gradient and position it where the strip was clicked
	 * @since 1.0.0
	*/
	onClick = e => {
		const { pageX } = e;
		const { current: strip } = this.stripRef;

		const rect = strip.getBoundingClientRect();
		const { width, left } = rect;
		
		const perc = Math.max( 0, Math.min( pageX - window.scrollX - left, width ) );
		const position = ( perc / width ) * 100;
		
		const { onAddColor } = this.context;
		onAddColor( position );
	};
	
	render() {
		const { appContext } = this.props;
		const { namespace, colorMode } = appContext;
		
		const {
			strip,
			hints,
			colors,
			activeHint,
			currentMode,
			currentColor,
			selectedColor,
			onDeleteColor,
			onActivateColor,
			onChangePosition,
		} = this.context;
		
		let currentColors;
		let colorSelected;
		
		if ( colorMode !== 'single' ) {
			if ( currentMode !== 'color' ) {
				currentColors = colors;
				colorSelected = selectedColor;
			} else {
				// only display one color point when in "single color mode"
				currentColors = [ colors[ selectedColor ] ];
				colorSelected = 0;
			}
		}
		
		const { unit: activeUnit } = currentColor;
		
		return (
			<div className={ `${ namespace }-preview-wrap` }>
				<div className={ `${ namespace }-preview` }>
					{ activeHint !== -1 && (
						<HintPoint 
							hint={ hints[ activeHint ] } 
							index={ activeHint }
						/> 
					) }
					<div 
						className={ `${ namespace }-preview-inner` } 
						style={ strip }
					></div>
					{ colorMode !== 'single' && (
						<>
							<div 
								className={ `${ namespace }-gradient-strip` } 
								onMouseDown={ this.onClick } 
								ref={ this.stripRef }
							></div>
							<div className={ `${ namespace }-gradient-points` }>
								{ currentColors.map( ( color, index ) => {
									return (
										<ColorPoint 
											key={ `${ namespace }-gradient-point-${ index }` } 
											color={ color } 
											stripRef={ this.stripRef }
											onChange={ onChangePosition }
											onDelete={ onDeleteColor }
											onActivate={ onActivateColor }
											active={ colorSelected === index }
											activeIndex={ colorSelected }
											activeUnit={ activeUnit }
											canDelete={ currentColors.length > 1 }
											index={ index }
										/> 
									);
								} ) }
							</div>
						</>
					) }
				</div>
			</div>
		);
	}
};

Strip.contextType = EditorContext;

export default withAppContext( Strip );