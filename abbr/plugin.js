/**
 * Dialog to produce HTML abbreviations.
 */

// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.plugins.html
// Make our plugin known to the editor.
CKEDITOR.plugins.add( 'abbr',
{
	// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.pluginDefinition.html#init
	// Our plugin initialization logic goes inside this method.
	init: function( editor )
	{
 		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html#addCommand
		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialogCommand.html
		// Define an editor command that opens a dialog to produce the abbreviation.
		editor.addCommand( 'abbrDialog',new CKEDITOR.dialogCommand( 'abbrDialog' ) );

		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.ui.html#addButton
		// To make such a command available to users, we'll have to place it on the toolbar by defining an associated toolbar button.
		editor.ui.addButton( 'Abbr',
		{
			label: 'Insert Abbreviation',
			// Connect with our defined command name.
			command: 'abbrDialog',
			// "this.path" refers to the directory where the plugin.js file resides.
			icon: this.path + 'images/icon.png'
		} );

		// Now we defines the "abbrDialog" dialog which was expected by our defined command.
		CKEDITOR.dialog.add( 'abbrDialog', function ()
		{
			return {
				// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.dialogDefinition.html
				title : 'Abbreviation Properties',

				// Define the minimum dimension of dialog contents.
				minWidth : 400,
				minHeight : 200,

				// Define dialog contents, include two tab pages, first page provides basic/mandatory attributes of abbreviation,
				// second page contains certain advanced/optional fields.
				contents :
				[
					{
						// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.contentDefinition.html
						id : 'tab1',
						// Displayed title for the tab page.
						label : 'Basic Settings',
						// TODO: we must extend the documentation for UI elements, providing a separate documentation page for each element
						// TODO: at this moment UI elements are explained better in the CKFinder documentation,
						// TODO: e.g. http://docs.cksource.com/ckfinder_2.x_api/symbols/CKFinder.dialog.definition.textInput.html

						// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.uiElementDefinition.html
						// Introduce two input fields which are by default in vertical layout.
						elements :
						[
							// One text input field to fill in abbreviation value.
							{
								type : 'text',
								id : 'abbr',
								label : 'Abbreviation',
								// TODO: validate is not explained in the documentation
								// Define a validator to make sure the abbreviation is not empty.
								validate : CKEDITOR.dialog.validate.notEmpty( "Abbreviation cannot be empty" )
							},
							// Another text input field for the explanatory title.
							{
								type : 'text',
								id : 'title',
								label : 'Title',
								// Define a validator to make sure the explanatory title is not empty.
								validate : CKEDITOR.dialog.validate.notEmpty( "Title cannot be empty" )
							}
						]
					},
					{
						id : 'tab2',
						label : 'Advanced Settings',
						elements :
						[
							// Text input field to receive element id.
							{
								type : 'text',
								id : 'id',
								label : 'Id'
							}
						]
					}
				],
				// This method is invoked once users confirmed the dialog.
				onOk : function() {
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html
					var dialog = this;

					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.document.html#createElement
					// Create a fresh copy of the DOM element.
					var abbr = editor.document.createElement( 'abbr' );

					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.element.html#setAttribute
					// Retrieve the value of the "title" dialog field from the tab page "tab1", send it to the created element as "title" attribute.
					abbr.setAttribute( 'title', dialog.getValueOf( 'tab1', 'title' ) );
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.element.html#setText
					// Set the element's text content with the value of the "abbr" dialog field.
					abbr.setText( dialog.getValueOf( 'tab1', 'abbr' ) );

					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html#getValueOf
					// Retrieve the value of 'id' field, send it to the created element if existed.
					var id = dialog.getValueOf( 'tab2', 'id' );

					if ( id )
						abbr.setAttribute( 'id', id );

					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html#insertElement
					// Insert the newly created abbreviation in place of the document text selection.
					editor.insertElement( abbr );
				}
			};
		} );

	}
} );
