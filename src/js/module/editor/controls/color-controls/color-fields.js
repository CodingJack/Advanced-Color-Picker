import React from 'react';
import ColorInputs from './color-fields/color-inputs';
import RadioMenu from '../../../../components/radio-menu';

const menuList = {
  rgb: 'RGB',
  hsl: 'HSL',
};

/*
 * @desc the rgb and hls inputs as well as the menu that switches between them
 * @since 1.0.0
*/
const ColorFields = ({ hsl, rgb, onChange, colorMenu, setColorMenu }) => {
  return (
    <>
      <RadioMenu
        active={colorMenu}
        onChange={setColorMenu}
        list={menuList}
      />
      {colorMenu === 'rgb' && (
        <ColorInputs
          type="rgb"
          value={rgb}
          onChange={onChange}

        />
      )}
      {colorMenu === 'hsl' && (
        <ColorInputs
          type="hsl"
          value={hsl}
          onChange={onChange}
        />
      )}
    </>
  );
}

export default ColorFields;








