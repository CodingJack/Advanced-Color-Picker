/*
 * all the Material Icons used in the App
*/

import React from 'react';

import {
  Save,
  Close,
  Check,
  Height,
  Launch,
  Layers,
  AddBox,
  Palette,
  Gradient,
  SwapVert,
  CropFree,
  ArrowBack,
  LibraryAdd,
  Assignment,
  RotateLeft,
  DesktopMac,
  LaptopMac,
  TabletMac,
  PhoneIphone,
  LayersClear,
  DeleteSweep,
  ErrorOutline,
  DeleteForever,
  ArrowDropUp,
  ArrowDropDown,
  ArrowForward,
  ArrowDownward,
  ArrowUpward,
  ArrowLeft,
  ArrowRight,
  InvertColors,
  InvertColorsOff,
} from '@material-ui/icons';


const icons = {
  save: Save,
  close: Close,
  check: Check,
  height: Height,
  launch: Launch,
  layers: Layers,
  add_box: AddBox,
  palette: Palette,
  gradient: Gradient,
  swap_vert: SwapVert,
  crop_free: CropFree,
  laptop_mac: LaptopMac,
  tablet_mac: TabletMac,
  desktop_mac: DesktopMac,
  phone_iphone: PhoneIphone,
  library_add: LibraryAdd,
  assignment: Assignment,
  rotate_left: RotateLeft,
  layers_clear: LayersClear,
  arrow_left: ArrowLeft,
  arrow_right: ArrowRight,
  arrow_back: ArrowBack,
  arrow_drop_up: ArrowDropUp,
  arrow_drop_down: ArrowDropDown,
  arrow_downward: ArrowDownward,
  arrow_upward: ArrowUpward,
  arrow_forward: ArrowForward,
  delete_sweep: DeleteSweep,
  error_outline: ErrorOutline,
  delete_forever: DeleteForever,
  invert_colors: InvertColors,
  invert_colors_off: InvertColorsOff,
};

const Icon = ({ type, style }) => {
  const Component = icons[type];
  return <Component style={style} />;
};

export default Icon;
