let defaultSettings = {
	size: 24,
	skin: 'classic',
	mode: 'full',
	conic: true,
	hints: true,
	conicNote: false,
	outputBar: true,
	multiStops: true,
};

const updateDefaults = settings => {
	defaultSettings = { ...defaultSettings, ...settings };
};

export {
	defaultSettings,
	updateDefaults,
}