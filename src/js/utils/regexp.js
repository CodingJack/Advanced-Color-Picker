/*
 * All the RegExp used to verify colors from user input
*/

const regHex = /^#?([a-f\d]{3}|[a-f\d]{6})$/;
const regHsl = /^hsl\((0|360|35\d|3[0-4]\d|[12]\d\d|0?\d?\d),(0|100|\d{1,2})%,(0|100|\d{1,2})%\)$/;
const regHsla = /^hsla\((0|360|35\d|3[0-4]\d|[12]\d\d|0?\d?\d),(0|100|\d{1,2})%,(0|100|\d{1,2})%,0|(0?\.\d|1(\.0)?)\)$/;
const regRgb = /^rgb\((0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d)\)$/;
const regRgba = /^rgba\((0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),(0|255|25[0-4]|2[0-4]\d|1\d\d|0?\d?\d),0|(0?\.\d|1(\.0)?)\)$/;
const regGradient = /^(linear\-gradient\(|radial\-gradient\(|conic\-gradient\(|repeating\-linear\-gradient\(|repeating\-radial\-gradient\(|repeating\-conic\-gradient\().*\)$/;
const regGradientNoConic = /^(linear\-gradient\(|radial\-gradient\(|repeating\-linear\-gradient\(|repeating\-radial\-gradient\().*\)$/;

export {
  regHex,
  regHsl,
  regHsla,
  regRgb,
  regRgba,
  regGradient,
  regGradientNoConic,
};