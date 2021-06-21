import React from 'react';
import PresetItems from './presets/preset-items';
import RadioMenu from '../../components/radio-menu';

import {
  EditorContext,
} from '../../context';

const {
  useContext,
} = React;

const menuList = {
  defaults: 'Defaults',
  custom: 'Custom',
};

/*
 * @desc represents a preset group, showing either a "defaults" view or a "custom" view
 * @since 1.0.0
*/
const Presets = ({ type, isSingle, columns = 4, minRows = 4 }) => {
  const editorContext = useContext(EditorContext);

  const {
    colorPresetMenu,
    gradPresetMenu,
    onChangePresetMenu,
  } = editorContext;

  let rows;
  const menu = type === 'color' ? colorPresetMenu : gradPresetMenu;

  if (menu === 'defaults' || isSingle) {
    rows = minRows;
  } else {
    rows = type === 'gradient' ? minRows - 1 : minRows - 2;
  }

  return (
    <>
      <RadioMenu
        active={menu}
        onChange={onChangePresetMenu}
        list={menuList}
        type={type}
      />
      <PresetItems
        type={type}
        menu={menu}
        columns={columns}
        minRows={rows}
      />
    </>
  );
};

export default Presets;