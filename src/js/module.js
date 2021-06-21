/*
 * this is the main entry point for the lazy-load chunks
*/
require('../scss/editor.scss');

import React from 'react';
import Editor from './module/editor';

const Module = props => <Editor {...props} />;

export default Module;

