import React from 'react';
import GradientSwitcher from './gradient-controls/gradient-switcher';
import RadialControls from './gradient-controls/radial-controls';
import RadioMenu from '../../../components/radio-menu';
import SelectBox from '../../../components/select-box';
import Toggle from '../../../components/toggle';
import Wheel from '../../../components/wheel';
import Row from '../../../components/wrappers/row';
import Panel from '../../../components/wrappers/panel';

import {
	AppContext,
} from '../../../context';

import {
	withEditorContext,
} from '../../../hoc/with-context';

import {
	getDirection,
} from '../../../utils/editor';

const {
	Component,
} = React;

const gradientTypes = {
	linear: 'Linear',
	radial: 'Radial',
	conic: 'Conic',
};

const gradientsNoConic = {
	linear: 'Linear',
	radial: 'Radial',
};

const radialShapes = {
	ellipse: 'Ellipse',
	circle: 'Circle',
	size: 'Size',
};

const radialExtents = {
	'closest-side': { label: 'Closest Side' },
	'closest-corner': { label: 'Closest Corner' },
	'farthest-side': { label: 'Farthest Side' },
	'farthest-corner': { label: 'Farthest Corner' },
};

const linearDirections = {
	'degree': { 
		label: 'Degrees', 
		icon: 'rotate_left',
		iconStyle: { top: '1px' },
	},
	'right': {
		label: 'To Right', 
		icon: 'arrow_forward',
	},
	'bottom': {
		label: 'To Bottom', 
		icon: 'arrow_downward',
	},
	'left': { 
		label: 'To Left', 
		icon: 'arrow_back',
	},
	'top': {
		label: 'To Top', 
		icon: 'arrow_upward',
	},
	'right_bottom': {
		label: 'To Right Bottom', 
		icon: 'arrow_downward', 
		iconStyle: { transform: 'rotate(-45deg)' },
	},
	'left_bottom': { 
		label: 'To Left Bottom', 
		icon: 'arrow_downward', 
		iconStyle: { transform: 'rotate(45deg)' },
	},
	'right_top': {
		label: 'To Right Top', 
		icon: 'arrow_upward', 
		iconStyle: { transform: 'rotate(45deg)' },
	},
	'left_top': { 
		label: 'To Left Top', 
		icon: 'arrow_upward', 
		iconStyle: { transform: 'rotate(-45deg)' },
	},
};

const positionLabels = [ 'Left', 'Top' ];
const sizeLabels = [ 'Width', 'Height' ];

class GradientControls extends Component {
	constructor() {
		super( ...arguments );
	}
	
	state = {
		angleChanging: false,
	};
	
	shouldComponentUpdate() {
		if ( this.bounce ) {
			this.bounce = false;
			return false;
		}
		
		return true;
	}
	
	static getDerivedStateFromProps( props, state ) {
		const { angleChanging } = state;
		if ( ! angleChanging ) {
			const { editorContext } = props;
			const { currentGradient } = editorContext;
			const { angle } = currentGradient;
			const curDirection = getDirection( angle );
			const { direction } = curDirection;
			return { direction };
		}
		
		return null;
	}
	
	onChange = ( value, opt, angleChanging ) => {
		const { editorContext } = this.props;
		const { onChangeGradient } = editorContext;
		
		if ( opt !== 'angle' ) {
			onChangeGradient( opt, value );
		} else {
			this.bounce = true;
			this.setState( { angleChanging }, () => {
				onChangeGradient( opt, value );
			} );
		}
	};
	
	onChangeDirection = value => {
		const direction = getDirection( value );
		const { value: angle } = direction;
		const { editorContext } = this.props;
		const { onChangeGradient } = editorContext;
		onChangeGradient( 'angle', angle );
	};
	
	render() {
		const { direction } = this.state;
		const { editorContext } = this.props;
		const { namespace, allowConic, conicNote } = this.context;
		
		const { 
			currentMode,
			currentGradient,
		} = editorContext;
		
		const { 
			angle, 
			shape,
			sizes,
			extent,
			repeating,
			positions,
			type: gradientType, 
		} = currentGradient;
		
		const disabledClass = currentMode !== 'color' ? '' : ` ${ namespace }-disabled`;
		const dataClassName = shape !== 'size' ? '' : `${ namespace }-sizes`;
		
		return (
			<Panel className={ `${ namespace }-gradients-panel${ disabledClass }` }>
				<Row className={ `${ namespace }-row-spacer ${ namespace }-row-with-btns` }>
					<GradientSwitcher />
				</Row>
				<Row className={ `${ namespace }-row-spacer` }>
					<RadioMenu 
						type="type"
						active={ gradientType }
						list={ allowConic ? gradientTypes : gradientsNoConic }
						onChange={ this.onChange }
					/>
				</Row>
				{ gradientType !== 'radial' && (
					<Row className={ `${ namespace }-row-wheel` }>
						<Wheel 
							type="angle"
							value={ angle } 
							onChange={ this.onChange } 
						/>
					</Row>
				) }
				{ gradientType === 'linear' && (
					<Row className={ `${ namespace }-row-direction` }>
						<SelectBox 
							isLong
							label="Direction"
							prop="direction"
							maxScrollable={ 5 }
							value={ direction }
							list={ linearDirections }
							onChange={ this.onChangeDirection }
						/>
					</Row>
				) }
				{ gradientType === 'radial' && (
					<>
						<Row className={ `${ namespace }-row-collapse` }>
							<RadioMenu 
								menu
								type="shape"
								active={ shape }
								list={ radialShapes }
								onChange={ this.onChange }
							/>
						</Row>
						{ shape === 'size' && (
							<RadialControls 
								prop="sizes"
								value={ sizes }
								onChange={ this.onChange }
								labels={ sizeLabels }
								className={ dataClassName }
							/>
						) }
					</>
				) }
				{ gradientType !== 'linear' && (
					<RadialControls 
						prop="positions"
						value={ positions }
						onChange={ this.onChange }
						labels={ positionLabels }
						className={ dataClassName }
					/>
				) }
				{ gradientType === 'radial' && shape !== 'size' && (
					<Row>
						<SelectBox 
							isLong
							cycleButtons
							label="Extent"
							prop="extent"
							value={ extent }
							list={ radialExtents }
							onChange={ this.onChange }
						/>
					</Row>
				) }
				<Row className={ `${ namespace }-row-repeating` }>
					<Toggle 
						type="repeating" 
						label="Repeating"
						value={ repeating } 
						onChange={ this.onChange } 
					/>
				</Row>
				{ gradientType === 'conic' && conicNote && (
					<span className={ `${ namespace }-note` }>
						<a href="https://caniuse.com/#feat=css-conic-gradients" target="_blank">Browser Support</a> for Conic Gradients varies
					</span>
				) }
			</Panel>
		);
	}
}

GradientControls.contextType = AppContext;

export default withEditorContext( GradientControls );	