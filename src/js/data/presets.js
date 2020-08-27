/*
 * the built-in default presets for the App
*/

let defColors = [];
let defGradients = [];

if ( typeof superBlocksGlobals !== 'undefined' ) {
	const { presetDefaults } = superBlocksGlobals;
	if ( presetDefaults ) {
		const { colors, gradients } = presetDefaults;
		defColors = colors || [];
		defGradients = gradients || [];
	}
}

const colorPresets = {
	defaults: [ ...defColors, ...[
		'#FFFFFF', '#000000', '#C7C7CC', '#8E8E93', '#575757',
		'#FF3A2D', '#009933', '#007AFF', '#FFCC00', '#ff9500',
		'#FFD3E0', '#FF69B4', '#ad62aa', '#fa114f', '#800000',
		'#2e99b0', '#5893d4', '#5856D6', '#6900ff', '#20366b',
		'#f9d5bb', '#fcd77f', '#ef7b7b', '#8f4426', '#396362',
		'#011f4b', '#03396c', '#005b96', '#6497b1', '#b3cde0',
		'#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5', '#ff8b94',
		'#d11141', '#00b159', '#00aedb', '#f37735', '#ffc425',
		'#ebf4f6', '#bdeaee', '#76b4bd', '#58668b', '#5e5656',
		'#edc951', '#eb6841', '#cc2a36', '#4f372d', '#00a0b0',
	] ],
	custom: [],
};

const gradientPresets = {
	defaults: [ ...defGradients, ...[
		'linear-gradient(#f7f7f7, #d7d7d7)',
		'linear-gradient(#4a4a4a, #2b2b2b)',
		'linear-gradient(#dbddde, #898c90)',
		'linear-gradient(#1ad6fd, #1d62f0)',
		'linear-gradient(#c644fc, #5856d6)',
		'linear-gradient(#ff5e3a, #ff2a68)',
		'linear-gradient(#e4ddca, #d6cec3)',
		'linear-gradient(#ffdb4c, #ffcd02)',
		'linear-gradient(#ff9500, #ff5e3a)',
		'linear-gradient(#52edc7, #5ac8fb)',
		'linear-gradient(#e4b7f0, #c86edf)',
		'linear-gradient(#87fc70, #0bd318)',
		'linear-gradient(#3d4e81, #5753c9, #6e7ff3)',
		'linear-gradient(160deg, #231557, #44107a 29%, #ff1361 67%, #fff800)',
		'linear-gradient(160deg, #69eacb, #eaccf8, #6654f1)',
		'linear-gradient(160deg, #ff057c, #7c64d5, #4cc3ff)',
		'linear-gradient(160deg, #ff057c, #8d0b93, #321575)',
		'linear-gradient(160deg, #a445b2, #d41872, #f06)',
		'linear-gradient(160deg, #9efbd3, #57e9f2, #45d4fb)',
		'linear-gradient(160deg, #ac32e4, #7918f2, #4801ff)',
		'linear-gradient(160deg, #7085b6, #87a7d9, #def3f8)',
		'linear-gradient(160deg, #22e1ff, #1d8fe1, #625eb1)',
		'linear-gradient(160deg, #2cd8d5, #6b8dd6, #8e37d7)',
		'linear-gradient(160deg, #2cd8d5, #c5c1ff 56%, #ffbac3)',
		'linear-gradient(#bfd9fe, #df89b5)',
		'linear-gradient(340deg, #616161, #9bc5c3)',
		'linear-gradient(90deg, #243949, #517fa4)',
		'linear-gradient(#eacda3, #e6b980)',
		'linear-gradient(45deg, #ee9ca7, #ffdde1)',
		'linear-gradient(340deg, #f794a4, #fdd6bd)',
		'linear-gradient(45deg, #874da2, #c43a30)',
		'linear-gradient(#f3e7e9, #dad4ec)',
		'linear-gradient(320deg, #2b5876, #4e4376)',
		'linear-gradient(60deg, #29323c, #485563)',
		'linear-gradient(#e9e9e7, #efeeec 25%, #eee 70%, #d5d4d0)',
		'linear-gradient(#fbc8d4, #9795f0)',
		'linear-gradient(#FC466B, #3F5EFB)',
		'linear-gradient(#3F2B96, #A8C0FF)',
		'linear-gradient(#efd5ff, #515ada)',
		'linear-gradient(#4b6cb7, #182848)',
		'linear-gradient(#e3ffe7, #d9e7ff)',
		'linear-gradient(135deg, #1CB5E0, #000851)',
		'linear-gradient(#00d2ff, #3a47d5)',
		'linear-gradient(135deg, #03001e, #7303c0, #ec38bc, #fdeff9)',
		'linear-gradient(#00C9FF, #92FE9D)',
		'linear-gradient(#f8ff00, #3ad59f)',
		'linear-gradient(#9ebd13, #008552)',
		'linear-gradient(135deg, #0700b8, #00ff88)',
		'linear-gradient(#FDBB2D, #3A1C71)',
		'linear-gradient(#fcff9e, #c67700)',
		'linear-gradient(#FDBB2D, #22C1C3)',
		'linear-gradient(#d53369, #daae51)',
		
	] ],
	custom: [],
};

export {
	colorPresets as coreColors,
	gradientPresets as coreGradients,
}