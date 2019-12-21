import getColorData from './data';
import { defaultSettings } from '../settings';

const processPresets = ( presets, gradients, allowConic ) => {
	return Array.from( new Set( presets ) ).map( preset => {
		if ( typeof preset !== 'string' ) {
			return preset;
		}

		const data = getColorData( preset, allowConic );
		const { gradient } = data;
		
		if ( gradients && ! gradient ) {
			return null;
		}
		
		return data;
	} ).filter( preset => preset !== null );
};

const verifyPresets = ( settings, defaults, allowConic, gradients ) => {
	let defaultPresets;
	let customPresets;
	
	if( typeof settings === 'object' ) {
		const { defaults: settingsDefaults, custom: settingsCustom } = settings;
		const { defaults: coreDefaults, custom: coreCustom } = defaults;
		
		if ( Array.isArray( settingsDefaults ) && settingsDefaults.length ) {
			defaultPresets = settingsDefaults;
		} else {
			defaultPresets = coreDefaults;
		}
		if ( Array.isArray( settingsCustom ) ) {
			customPresets = settingsCustom;
		} else {
			customPresets = coreCustom;
		}
	} else {
		defaultPresets = coreDefaults;
		customPresets = coreCustom;
	}
	
	return {
		defaults: processPresets( defaultPresets, gradients, allowConic ),
		custom: processPresets( customPresets, gradients, allowConic ),
	};
}

const initPresets = ( coreColors, coreGradients, allowConic ) => {
	const {
		colorPresets,
		gradientPresets,
	} = defaultSettings;
	
	const color = verifyPresets( colorPresets, coreColors, allowConic );
	const gradient = verifyPresets( gradientPresets, coreGradients, allowConic, true );
	
	defaultSettings.colorPresets = color;
	defaultSettings.gradientPresets = gradient;
	
	return { color, gradient };
}

export default initPresets;
