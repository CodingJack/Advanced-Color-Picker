# Advanced Color Picker
Harnessing the full power of CSS Gradients | [Full Demo](http://www.codingjack.com/advanced-color-picker/)

![Screenshot of the Color Picker Editor in Full Mode](/screenshot.jpg)

## Description

Advanced Color Picker includes full support for modern CSS Gradients, with the ability to translate any valid CSS Gradient into editable controls.

## Features

* **Stacked Gradients** - Bleed semi-transparent gradients into one another
* **Color Hints** - Change the midpoint transition point between colors
* **Pixel-based units** - Set positions to percentage or pixel-based values 
* **Repeating Gradients** - Create interesting patterns with pixel-based units
* **Conic Gradients** - Experiment with conic gradients supported in Chrome & Safari
* **Simple Editor Mode** - Can be used for non-gradient editing (text-color, etc.) via "single" mode
* **Copy/Paste Gradients** - Copy any gradient from the web and paste it into the editor (it's like magic)

## Getting Started

[Download](https://github.com/CodingJack/Advanced-Color-Picker/raw/master/advanced_color_picker.zip) the plugin and copy the files inside the "js" folder to your site.  Then add the main script to your web page, setup an input field to be used for the swatch, and "init" the plugin with your custom settings.

## Basic Setup & Options

```html
<!-- example input field that will be automatically converted to a swatch -->
<input type="hidden" class="cj-colorpicker" value="linear-gradient(red, blue)" />

<!-- main script to load -->
<script type="text/javascript" id="cj-colorpicker" src="js/cj-color.min.js"></script>
```

```js
// initial call with custom settings and their defaults
window.advColorPicker( {
	// "full" = all controls, "single" = only color controls (no gradients)
	mode: 'full', 
	
	// the size of the color picker swatches
	size: 24, 
	
	// the color picker swatch skin, "classic" or "light"
	skin: 'classic', 
	
	// optional color for the modal background
	modalBgColor: 'rgba(0,0,0,0.5)', 
	
	// optional id attribute to apply to the editor's outermost wrapper
	editorId: null,
	
	// allow multi-color stops in output
	// multi-color stops allow for condensed output but are not supported in Edge
	multiStops: true,
	
	// allow conic gradients (only supported in webkit browsers)
	conic: true, 
	
	// show a warning note for conic gradients (if conic is enabled)
	conicNote: false, 
	
	// show the bar at the bottom of the screen displaying the final output value
	outputBar: false, 
	
	// set the value of your input when a color is changed
	onColorChange: ( input, color ) => input.value = color, 
	
	// your default and/or custom color presets
	colorPresets: { defaults: [], custom: [] }, 
	
	// your default and/or gradient presets
	gradientPresets: { defaults: [], custom: [] }, 
	
	// your save/delete preset callback function
	onSaveDeletePreset, 
} );
```

## data-attr options for input fields
* **type** - "hidden" or "text" required
* **class** - must match the "inputClass" const inside the index.js source file (currently: "cj-colorpicker")
* **value** - any valid CSS color (an empty value will translate to "transparent")
* **data-mode** - "single" (only color controls) or "full" (colors + gradient controls) - default: "full"
* **data-size** - the width/height of the swatch - default: "24"
* **data-skin** - "classic" or "light", the swatch skin - default: "classic"
```html
<input 
	type="hidden" 
	class="cj-colorpicker" 
	value="linear-gradient(blue, red)" 
	data-mode="full"
	data-size="24"
	data-skin="classic"
/>
```

## Example "onColorChange" callback
```js
const onColorChange = ( input, color ) => input.value = color;
```

## Example "onSaveDeletePreset" callback
```js
const onSaveDeletePreset = ( {
	action, // "save" or "delete"
	groupChanged, // "color" or "gradient"
	colorPresets, // the current custom color presets array
	gradientPresets, // the current custom gradient presets array
} ) => {
	// example saving to local storage
	window.localStorage.setItem( 'presets', JSON.stringify( { 
		colorPresets, 
		gradientPresets,
	}));
};
```

## Link to the Demo and open the editor automatically with a custom value
```
// encode the value beforehand via encodeURIComponent()
http://www.codingjack.com/advanced-color-picker/?open=true&value=linear-gradient(blue%2C%20red)
```

## Editing JS/SCSS source files
```
npm install
npm run watch
npm run build
```

## Built With / Technology Used

* [React](https://www.npmjs.com/package/react)
* [SASS](https://www.npmjs.com/package/sass)
* [Babel](https://www.npmjs.com/package/@babel/core)
* [Webpack](https://www.npmjs.com/package/webpack)
* [ESLint](https://www.npmjs.com/package/eslint)
* [core-js](https://www.npmjs.com/package/core-js)
* [array-move](https://www.npmjs.com/package/array-move)
* [React Sortable HOC](https://www.npmjs.com/package/react-sortable-hoc)
* [Material Icons](https://www.npmjs.com/package/material-icons)

## Authors

* **Jason McElwaine** - *Initial work* - [CodingJack](http://www.codingjack.com)

## License

* The original work in this project is licensed under [MIT](https://opensource.org/licenses/MIT)
* All dependencies and cited technology above excluding Material Icons is licensed under [MIT](https://opensource.org/licenses/MIT)
* [Material Icons](https://www.npmjs.com/package/material-icons) is licensed under [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Additional Notes

* If used in cases where all browsers must be accounted for, set the "multiStops" and "conic" options to false. 
* The APP does not automatically write values to the corresponding input field (intentionally).  So the init settings should always include an "onColorChange" callback function.
* Pixel based units for positioning and radial sizes have a maximum value of 800px in order to translate them properly into the editor visually.

## Single Mode - Where the editor is restricted to single colors only (for text-color, etc.)

![Screenshot of the Color Picker Editor in Single Mode](/single_screenshot.jpg)
