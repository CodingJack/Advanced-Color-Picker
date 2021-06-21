/*
 * the two main context points used by the App
*/

import React from 'react';

const {
  createContext,
} = React;

const AppContext = createContext(); // Provider: index.js
const EditorContext = createContext(); // Provider: module/editor.js

export {
  AppContext,
  EditorContext,
}