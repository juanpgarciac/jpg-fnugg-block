/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
 
import FnuggAutocomplete from './components/fnugg-autocomplete';
import FnuggCard from './components/fnugg-card';

export default function Edit(props) {

    const { attributes,setAttributes } = props;

	function onChangeResort(_resortData){
        //When the admin changes a resort the attributes are updated for published content
		setAttributes({resortData:_resortData});
	}

    if(!attributes.id){
        //give an unique Id to the autocomplete block (and save it)
        setAttributes({id:''+Date.now()});
    }

    return (
		<div { ...useBlockProps( {   className:"jpg-fnugg-block" } ) } >
			<FnuggAutocomplete 
				id={ attributes.id }
				onChange = { onChangeResort }
				attrs={attributes}
				__={ __ }
			/>
			<br />
			<FnuggCard attrs = {attributes} __={ __ } />
		</div>
	);
}
