import React from 'react';
import Button from './button';

import { 
	AppContext,
} from '../../context';

const {
	memo,
	useContext,
} = React;

const ButtonGroup = ( { slug, type, items, active, onChange } ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	
	return (
		<span className={ `${ namespace }-btn-group` }>
		{	
			Object.keys( items ).map( key => {
				return (
					<Button 
						key={ `${ namespace }-${ slug }-${ key }` }
						type={ type } 
						icon={ items[ key ] } 
						onClick={ () => onChange( key ) } 
						activeState={ key === active }
					/>
				);
			} )
		}
		</span>
	);
};

export default memo( ButtonGroup );