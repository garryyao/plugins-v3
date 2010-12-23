/**
 * @author CKSource Team
 * @fileOverview Dialog to produce HTML abbreviations.
 */


// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.plugins.html
// Make our plugin known to the editor.
CKEDITOR.plugins.add( 'abbr',
{
	// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.pluginDefinition.html#init
	// Our plugin initialization logic goes inside this method.
	init: function( editor )
	{
		// "this.path" refers to the directory where the plugin.js file resides.
		var iconPath = this.path + 'images/icon.png';

 		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html#addCommand
		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialogCommand.html
		// Define an editor command that opens a dialog to produce the abbreviation.
		editor.addCommand( 'abbrDialog', new CKEDITOR.dialogCommand( 'abbrDialog' ) );

		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.ui.html#addButton
		// To make such a command available to users, we'll have to place it on the toolbar by defining an associated toolbar button.
		editor.ui.addButton( 'Abbr',
		{
			label: 'Insert Abbreviation',
			// Connect with our defined command name.
			command: 'abbrDialog',
			icon: iconPath
		} );

		// Add context menu
		if ( editor.contextMenu )
		{
			// Register menu group
			editor.addMenuGroup( 'myGroup' );
			// Register menu item
			editor.addMenuItem( 'abbrItem',
			{
				label : 'Edit Abbreviation',
				icon : iconPath,
				command : 'abbrDialog',
				group : 'myGroup'
			});

			// Enable context menu only for <abbr> element
			editor.contextMenu.addListener( function( element, selection )
				{
					if ( !element || !element.is( 'abbr' ) || element.data( 'cke-realelement' ) || element.isReadOnly() )
						return null;

					return { abbrItem : CKEDITOR.TRISTATE_OFF };
				});
		}

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
								// TODO: list predefined validators
								// Define a validator to make sure the abbreviation is not empty.
								validate : CKEDITOR.dialog.validate.notEmpty( "Abbreviation cannot be empty" ),
								// Function to be run when setupContent method of the parent dialog is called.
								// It can be used to initialize the value of the field.
								setup : function( element )
								{
									this.setValue( element.getText() );
								},
								// Set the element's text content with the value of this field.
								commit : function( element )
								{
									element.setText( this.getValue() );
								}
							},
							// Another text input field for the explanatory title.
							{
								type : 'text',
								id : 'title',
								label : 'Title',
								// Define a validator to make sure the explanatory title is not empty.
								validate : CKEDITOR.dialog.validate.notEmpty( "Title cannot be empty" ),
								setup : function( element )
								{
									this.setValue( element.getAttribute( "title" ) );
								},
								// Set the element's title attribute with the value of this field.
								commit : function( element )
								{
									element.setAttribute( "title", this.getValue() );
								}
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
								label : 'Id',
								setup : function( element )
								{
									this.setValue( element.getAttribute( "id" ) );
								},
								commit : function ( element )
								{
									var id = this.getValue();

									if ( id )
										element.setAttribute( 'id', id );
									else if ( !this.insertMode )
										element.removeAttribute( 'id' );
								}
							}
						]
					}
				],

				onShow : function()
				{
					// TODO: getting selected element is not working well :(
					var sel = editor.getSelection(),
						element = sel.getStartElement();

					if ( !element || element.getName() != 'abbr' || element.data( 'cke-realelement' ) )
					{
						element =  editor.document.createElement( 'abbr' );
						this.insertMode = true;
					}

					// Store a reference to the abbr element, we'll use it in the onOk function later
					this.element = element;

					// Invoke the setup functions
					this.setupContent( this.element );
				},

				// This method is invoked once users confirmed the dialog.
				onOk : function() {
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html
					var dialog = this,
						abbr = this.element;

					// Insert new abbr element if we're not editing already existing alement.
					if ( this.insertMode )
						editor.insertElement( abbr );

					// Update the element with values entered by user (invoke commit() functions).
					this.commitContent( abbr );
				}
			};
		} );

	}
} );
