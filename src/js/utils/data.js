/*
 * The functions in this file are used for converting swatch input values into editor data
*/

import {
  writeGradientColor,
  getGradientObject,
} from './gradients';

import {
  cssGradient,
  buildGradientStrip,
} from '../utils/output';

import {
  cssColor,
  getRawHex,
  getRgbHslValues,
  getValuesFromHex,
} from './colors';

import {
  getValuesFromHsl,
} from './hsl';

import {
  regHex,
  regHsl,
  regHsla,
  regRgb,
  regRgba,
  regGradient,
  regGradientNoConic,
} from './regexp';

import {
  defaultGradient,
} from '../data/defaults';

import {
  colorNames,
  colorNameKeys,
} from '../data/color-names';

/*
 * @desc creates a default gradient data object
 * @returns object
 * @since 1.0.0
*/
const defaultValue = () => {
  const defGradient = defaultGradient();
  defGradient.colors = [writeGradientColor([0, 0, 0, 0], 0)];

  return {
    hex: '#000',
    rgba: [0, 0, 0, 0],
    value: [defGradient],
    output: 'transparent',
    preview: { background: 'transparent' },
    strip: { background: 'transparent' },
  };
};

/*
 * @desc converts all incoming input values into editor data
 * @param boolean conic - if the editor supports "conic mode" or not
 * @returns object - the master editor data
 * @since 1.0.0
*/
const getColorData = (clr, conic = true) => {
  if (!clr || typeof clr !== 'string') {
    return defaultValue();
  }

  let rawColor = clr.replace(/;|\:|\{|\}/g, '')
    .replace(/-webkit-|-moz-/, '')
    .replace('background-color', '')
    .replace('background-image', '')
    .replace('background', '')
    .replace('color', '')
    .toLowerCase()
    .trim();

  if (rawColor === 'transparent') {
    return defaultValue();
  }

  const regExpGradient = conic ? regGradient : regGradientNoConic;
  if (regExpGradient.test(rawColor)) {
    const value = getGradientObject(rawColor);
    const output = cssGradient(value);
    const gradient = value[value.length - 1];
    const { colors, hints } = gradient;

    return {
      value,
      output,
      gradient: true,
      preview: { background: output },
      strip: { background: buildGradientStrip(colors, hints) },
    };
  }

  let colorName;
  rawColor = rawColor.replace(/\s/g, '');

  if (colorNameKeys.includes(rawColor)) {
    colorName = true;
    rawColor = colorNames[rawColor];
  }

  if (colorName || regHex.test(rawColor)) {
    const colorValue = getValuesFromHex(rawColor);
    const color = cssColor(colorValue);

    const defGradient = defaultGradient();
    defGradient.colors = [writeGradientColor(colorValue, 0)];

    return {
      value: [defGradient],
      output: color,
      rgba: colorValue,
      hex: getRawHex(colorValue),
      preview: { background: color },
      strip: { background: color },
    };
  }

  const rgb = regRgb.test(rawColor);
  const rgba = regRgba.test(rawColor);
  let hsl;
  let hsla;

  if (!rgb && !rgba) {
    hsl = regHsl.test(rawColor);
    hsla = regHsla.test(rawColor);
  }

  if (rgb || rgba || hsl || hsla) {
    let colorValue;
    if (rgb || rgba) {
      colorValue = getRgbHslValues(rawColor);
    } else {
      colorValue = getValuesFromHsl(rawColor);
    }

    const color = cssColor(colorValue);
    const defGradient = defaultGradient();
    defGradient.colors = [writeGradientColor(colorValue, 0)];

    return {
      output: color,
      rgba: colorValue,
      value: [defGradient],
      hex: getRawHex(colorValue),
      preview: { background: color },
      strip: { background: color },
    };
  }

  return defaultValue();
};

export default getColorData;
