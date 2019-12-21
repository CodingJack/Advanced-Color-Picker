import React from 'react';
import Button from '../components/buttons/button';

import {
	AppContext,
} from '../context';

const {
	useContext,
} = React;

const previewSizes = {
	full: 'crop_free',
	desktop: 'desktop_mac',
	laptop: 'laptop_mac',
	tablet: 'tablet_mac',
	phone: 'phone_iphone',
};

const FullPreview = ( {
	preview,
	previewSize,
	onClosePreview,
	onChangePreviewSize,
} ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	
	return (
		<>
			<div className={ `${ namespace }-bg-inner` }>
				<div className={ `${ namespace }-bg-preview` } style={ preview }></div>
			</div>
			<div className={ `${ namespace }-bg-btns` }>
				{ 
					Object.keys( previewSizes ).map( size => {
						const icon = previewSizes[ size ];
						
						return (
							<Button 
								key={ `${ namespace }-${ size }` }
								type="medium"
								icon={ icon }
								onClick={ onChangePreviewSize }
								dataAttrs={ { 'data-size': size } }
								activeState={ size === previewSize }
							/>
						);
					} )
				}
				<Button 
					type="medium"
					icon="close"
					onClick={ onClosePreview }
				/>
			</div>
		</>
	);
	
};

export default FullPreview;