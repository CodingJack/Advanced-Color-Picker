import {
	maxPositionPixels,
} from '../data/defaults';

const formatPresets = presets => {
	return presets.slice().map( preset => preset.output );
};

const parseBoolean = val => {
	return val === true || val === 'true' || val === 1 || val === '1' || val === 'on';
};

const booleanSetting = ( global, defValue, local ) => {
	if ( local !== undefined ) {
		return parseBoolean( local )
	}
	if ( global !== undefined ) {
		return parseBoolean( global )
	}
	return defValue;
};

const verifySettingRegExp = options => {
	let regString = '';
	
	options.forEach( ( opt, index ) => {
		if( index > 0 ) regString += '|';
		regString += `^${ opt }$`;
	} );

	return new RegExp( `${ regString }` );
}

const verifiableSettings = {
	mode: {
		options: ['full', 'single'],
		defaultValue: 'full',
	},
};

const verifySetting = ( local, global, setting ) => {
	const localSetting = typeof local === 'string' ? local.toLowerCase().trim() : null;
	const globalSetting = typeof global === 'string' ? global.toLowerCase().trim() : null;
	
	const { options, defaultValue } = verifiableSettings[ setting ];
	const regex = verifySettingRegExp( options );
	
	if( regex.test( localSetting ) ) {
		return localSetting;
	}
	if( regex.test( globalSetting ) ) {
		return globalSetting;
	}
	return defaultValue;
};

const setSwatchStyle = ( 
	swatch, 
	inner,
	swatchClass, 
	inputSize, 
	inputSkin, 
	settings 
) => {
	const { size: settingsSize, skin: settingsSkin } = settings;
	const skin = inputSkin || settingsSkin;
	
	let size = inputSize || settingsSize || 24;
	let className = swatchClass;
	
	if ( skin !== 'default' ) {
		className += ` ${ swatchClass }-${ skin }`;
	}
	if ( /^[0-9]+$/.test( size ) ) {
		const perc = size / maxPositionPixels;
		const scaled = `${ maxPositionPixels }px`;
		inner.style.width = scaled;
		inner.style.height = scaled;
		inner.style.transform = `scale(${ perc })`;
		size += 'px';
	} else {
		inner.style.width = '100%';
		inner.style.height = '100%';
		inner.style.transform = null;
	}
	
	swatch.className = className;
	swatch.style.width = size;
	swatch.style.height = size;
};

export {
	verifySetting,
	setSwatchStyle,
	booleanSetting,
	formatPresets,
};