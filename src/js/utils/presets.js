import getColorData from './data';
import {
  defaultSettings,
} from '../settings';

/*
 * @desc converts all pre-exisiting presets into Objects of data
 * @param array presets - the incoming Array of preset strings (colors/gradients)
 * @param boolean gradients - if the presets being processed are regular colors or gradients
 * @param boolean allowConic - if the editor supports "conic mode" or not
 * @returns a final Array of preset Objects that filter out ones that couldn't be processed
 * @since 1.0.0
*/
const processPresets = (presets, gradients, allowConic) => {
  return Array.from(new Set(presets)).map(preset => {
    if (typeof preset !== 'string') {
      return preset;
    }

    const data = getColorData(preset, allowConic);
    const { gradient } = data;

    if (gradients && !gradient) {
      return null;
    }

    return data;
  }).filter(preset => preset !== null);
};

/*
 * @desc attempts to use presets from admin settings and then falls back to defaults
 * @param object settings - the current admin settings passed into the widget
 * @param object defaults - the editors default settings
 * @param boolean allowConic - if the editor supports "conic mode" or not
 * @param boolean gradients - if the current presets being processed are gradients
 * @returns the processed presets for its respective group (colors or gradients)
 * @since 1.0.0
*/
const verifyPresets = (settings, defaults, allowConic, gradients) => {
  let defaultPresets;
  let customPresets;
  const { defaults: coreDefaults, custom: coreCustom } = defaults;

  if (typeof settings === 'object') {
    const { defaults: settingsDefaults, custom: settingsCustom } = settings;

    if (Array.isArray(settingsDefaults) && settingsDefaults.length) {
      defaultPresets = settingsDefaults;
    } else {
      defaultPresets = coreDefaults;
    }
    if (Array.isArray(settingsCustom)) {
      customPresets = settingsCustom;
    } else {
      customPresets = coreCustom;
    }
  } else {
    defaultPresets = coreDefaults;
    customPresets = coreCustom;
  }

  return {
    defaults: processPresets(defaultPresets, gradients, allowConic),
    custom: processPresets(customPresets, gradients, allowConic),
  };
}

/*
 * @desc the entry point when presets are first processed
 * @param object coreColors - the editors default preset colors
 * @param object coreGradients - the editors default preset gradients
 * @param boolean allowConic - if the editor supports "conic mode" or not
 * @returns the final presets to be used in the editor 
 * @since 1.0.0
*/
const initPresets = (coreColors, coreGradients, allowConic) => {
  const {
    colorPresets,
    gradientPresets,
  } = defaultSettings;

  const color = verifyPresets(colorPresets, coreColors, allowConic);
  const gradient = verifyPresets(gradientPresets, coreGradients, allowConic, true);

  defaultSettings.colorPresets = color;
  defaultSettings.gradientPresets = gradient;

  return { color, gradient };
}

export default initPresets;
