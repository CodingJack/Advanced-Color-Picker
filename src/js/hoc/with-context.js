import React from 'react';

import { 
	AppContext,
	EditorContext,
} from '../context';

export const withAppContext = Component => ( props => (
	<AppContext.Consumer>
		{ context => <Component appContext={ context } { ...props } /> }
	</AppContext.Consumer>
) );

export const withEditorContext = Component => ( props => (
	<EditorContext.Consumer>
		{ context => <Component editorContext={ context } { ...props } /> }
	</EditorContext.Consumer>
) );