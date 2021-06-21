/*
 * the default settings which are then overwritten by any possible admin settings
*/

let defaultSettings = {
  size: 24,
  skin: 'classic',
  mode: 'full',
  conic: true,
  conicNote: false,
  outputBar: false,
  multiStops: true,
  className: null,
  modalBgColor: 'rgba(0,0,0,0.5)',
};

const updateDefaults = settings => {
  defaultSettings = { ...defaultSettings, ...settings };
};

export {
  defaultSettings,
  updateDefaults,
}