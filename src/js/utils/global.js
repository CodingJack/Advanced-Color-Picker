/*
  This file includes helper functions that need to be packed in the main index file (not the subsequent chunks)
*/

import {
  maxPositionPixels,
} from '../data/defaults';

/*
 * @desc converts the current preset data to an Array of CSS colors to send back to admin
 * 		 after a preset has been saved or deleted
 * @returns array
 * @since 1.0.0
*/
const formatPresets = presets => {
  return presets.slice().map(preset => preset.output);
};

/*
 * @desc verifies an admin Boolean setting 
 * @returns boolean
 * @since 1.0.0
*/
const parseBoolean = val => {
  return val === true || val === 'true' || val === 1 || val === '1' || val === 'on';
};

/*
 * @desc verifies an admin Boolean setting checking the data-attr first and then the global settings
 * @returns boolean
 * @since 1.0.0
*/
const booleanSetting = (global, defValue, local) => {
  if (local !== undefined) {
    return parseBoolean(local)
  }
  if (global !== undefined) {
    return parseBoolean(global)
  }
  return defValue;
};

/*
 * @desc creates a new RegExp to use to verify incoming settings
 * @returns RegExp
 * @since 1.0.0
*/
const verifySettingRegExp = options => {
  let regString = '';

  options.forEach((opt, index) => {
    if (index > 0) regString += '|';
    regString += `^${opt}$`;
  });

  return new RegExp(`${regString}`);
}

/*
 * @desc widget settings that exist as strings that need to be verified
 * @since 1.0.0
*/
const verifiableSettings = {
  mode: {
    options: ['full', 'single'],
    defaultValue: 'full',
  },
};

/*
 * @desc verifies incoming settings that are intended to exist as strings
 * @since 1.0.0
*/
const verifySetting = (local, global, setting) => {
  const localSetting = typeof local === 'string' ? local.toLowerCase().trim() : null;
  const globalSetting = typeof global === 'string' ? global.toLowerCase().trim() : null;

  const { options, defaultValue } = verifiableSettings[setting];
  const regex = verifySettingRegExp(options);

  if (regex.test(localSetting)) {
    return localSetting;
  }
  if (regex.test(globalSetting)) {
    return globalSetting;
  }
  return defaultValue;
};

/*
 * @desc sets the style of the color picker swatch based on the admin settings
 * @param HTMLElement swatch - the swatch's outermost wrapper
 * @param HTMLElement inner - the swatch's inner container which holds the background style
 * @param string swatchClass - the class name defined in index.js to add to the swatch
 * @param string|number inputSize - the potential "data-size" attribute for the swatch input field
 * @param string inputSkin - the potential "data-skin" attribute for the swatch input field
 * @param object settings - the current admin settings
 * @since 1.0.0
*/
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

  if (skin !== 'classic') {
    className += ` ${swatchClass}-${skin}`;
  }
  if (/^[0-9]+$/.test(size)) {
    const perc = size / maxPositionPixels;
    const scaled = `${maxPositionPixels}px`;
    inner.style.width = scaled;
    inner.style.height = scaled;
    inner.style.transform = `scale(${perc})`;
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