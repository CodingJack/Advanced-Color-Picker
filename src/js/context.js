import React from 'react';

const { 
	createContext,
} = React;

const AppContext = createContext();
const EditorContext = createContext();

export {
	AppContext,
	EditorContext,
}