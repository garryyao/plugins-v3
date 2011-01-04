/**
 * Dialog for managing abbr element.
 */
// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.plugins.html
CKEDITOR.plugins.add( 'abbr',
{
	// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.pluginDefinition.html#init
	init: function( editor )
	{
		CKEDITOR.dialog.add( 'abbrDialog', function ()
		{
			return {
				// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.dialogDefinition.html
				title : 'Abbreviation Properties',
				minWidth : 400,
				minHeight : 200,
				contents :
				[
					{
						// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.contentDefinition.html
						id : 'tab1',
						title : 'Abbreviation Settings',
						label : 'Abbr Properties',
						expand : true,
						// TODO: we must extend the documentation for UI elements, providing a separate documentation page for each element
						// TODO: at this moment UI elements are explained better in the CKFinder documentation, 
						// TODO: e.g. http://docs.cksource.com/ckfinder_2.x_api/symbols/CKFinder.dialog.definition.textInput.html

						// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.uiElementDefinition.html
						elements :
						[
							{
								type : 'text',
								id : 'abbr',
								label : 'Abbreviation',
								'default' : '',
								// TODO: validate is not explained in the documentation
								validate : CKEDITOR.dialog.validate.notEmpty( "Abbreviation cannot be empty" )
							},
							{
								type : 'text',
								id : 'title',
								label : 'Title',
								'default' : '',
								validate : CKEDITOR.dialog.validate.notEmpty( "Title cannot be empty" )
							}
						]
					},
					{
						id : 'tab2',
						title : 'Advanced Settings',
						label : 'Advanced',
						expand : true,
						elements :
						[
							{
								type : 'text',
								id : 'id',
								label : 'Id',
								'default' : ''
							}
						]
					},
				],
				onOk : function() {
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html
					var dialog = this;
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.document.html#createElement
					var abbr = editor.document.createElement( 'abbr' );
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html#getValueOf
					var id = dialog.getValueOf( 'tab2', 'id' );

					if ( id )
						abbr.setAttribute( 'id', id );

					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.element.html#setAttribute
					abbr.setAttribute( 'title', dialog.getValueOf( 'tab1', 'title' ) );
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.element.html#setText
					abbr.setText( dialog.getValueOf( 'tab1', 'abbr' ) );

					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html#insertElement
					editor.insertElement( abbr );
					// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html#hide
					dialog.hide();
				}
			};
		} );

 		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html#addCommand
		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.commandDefinition.html 
		var command = editor.addCommand( 'abbrDialog',
		{
			exec : function()
			{
				// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html#openDialog
				editor.openDialog( 'abbrDialog' );
			}
		} );

		// this = this plugin
		// in this case, "this" wil be an object containing the init function defined above 
		// and the "path" property that is automatically added by CKEditor
		var iconPath = this.path + 'images/icon.png';

		// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.ui.html#addButton
		editor.ui.addButton( 'Abbr',
		{
			label: 'Insert Abbreviation',
			// command name used in editor.addCommand
			command: 'abbrDialog',
			icon: iconPath
		} );
	}
} );
