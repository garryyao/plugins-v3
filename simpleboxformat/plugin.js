/**
 * Dialog for managing paragraph formatting.
 */
CKEDITOR.plugins.add( 'simpleboxformat',
{
	init: function( editor )
	{
		function currentBlock()
		{
			var selection = editor.getSelection(),
				path = new CKEDITOR.dom.elementPath( selection.getStartElement() );
			return path.block;
		}

		var dialogadvtab = editor.plugins.dialogadvtab;
	   CKEDITOR.dialog.add( 'boxFormat', function ()
	   {
		  return {
			 title : 'Box Formatting Dialog',
			 minWidth : 500,
			 minHeight : 200,
			 contents :
			[
				  {
					 id : 'info',
					 title : 'Basic Formattings',
					 label : 'Basic',
					 expand : true,
					 elements :
						   [
							   {
								   type : 'vbox',
								   padding : 1,
								   children :
								   [
									   {
										   type : 'hbox',
										   padding : 0,
										   widths : [ '80%', '20%' ],
										   children :
												   [
													   {
														   type : 'text',
														   id : 'borderWidth',
														   label : 'Border Size',
														   'default' : 0,
														   validate : CKEDITOR.dialog.validate['number']( 'CSS length must be of number.' ),
														   setup : function( element )
														   {
															   this.setValue( parseInt( element.getStyle( name ), 10 ) || '' );
														   },
														   commit : function( element )
														   {
															   var val = this.getValue();
															   if ( val )
															   {
																   var unitField = this.getDialog().getContentElement( 'info', 'borderWidthUnit' );
																   element.setStyle( 'border-width', this.getValue() + unitField.getValue() );
															   }
															   else
																   element.removeStyle( 'border-width' );
														   }
													   },
													   {
														   type : 'select',
														   id :  'borderWidthUnit',
														   label : 'Border Width Unit',
														   labelStyle: 'visibility:hidden',
														   style: 'margin-left: 10px',
														   'default' : 'pixels',
														   items :
																   [
																	   [ 'Pixels' , 'px'],
																	   [ 'Em' , 'em'],
																	   [ 'Points' , 'pt']
																   ],
														   setup : function( element )
														   {
															   var widthMatch = /em|px|pt/.exec( element.getStyle( 'border-width' ) );
															   this.setValue( widthMatch ? widthMatch[ 0 ] : 'px' );
														   }
													   }
												   ]
									   },
									   {
										   type : 'select',
										   id : 'borderStyle',
										   label : 'Border Style',
										   'default' : '',
										   items :
										   [
											   [ 'none', '' ],
											   [ 'dotted' ],
											   [ 'dashed' ],
											   [ 'solid' ],
											   [ 'double' ],
											   [ 'groove' ],
											   [ 'ridge' ],
											   [ 'inset' ],
											   [ 'outset' ]
										   ],
										   setup : function( element )
										   {
												this.setValue( element.getStyle( 'border-style' ) || '' );
										   },
										   commit : function( element )
										   {
												var val = this.getValue();
												if ( val )
													element.setStyle( 'border-style', val );
												else
													element.removeStyle( 'border-style', val );
										   }
									   }
								   ]
							   }
						   ]
				  },
				 dialogadvtab && dialogadvtab.createAdvancedTab( editor, { id:1, dir:1, classes:1 } )
			],
			onOk : function()
			{
				this.commitContent( this.selectedElement );
			},
			onShow : function()
			{
				this.setupContent( this.selectedElement = currentBlock() );
			}
		  };
	   } );

		var command = editor.addCommand( 'boxFormat',
		{
			exec : function()
			{
				editor.openDialog( 'boxFormat' );
			}
		} );

		editor.on( 'selectionChange', function()
		{
			command.setState( currentBlock() ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED );
		});

		var iconPath = this.path + 'images/icon.gif';
		editor.ui.addButton( 'BoxFormat',
		{
			label: 'Element Formatting Properties dialog',
			command: 'boxFormat',
			icon: iconPath
		} );

		if ( editor.contextMenu )
		{
			editor.addMenuGroup( 'format' );
			editor.addMenuItem( 'boxformat',
			{
				label : 'Edit Box Formatting',
				icon : iconPath,
				command : 'boxFormat',
				group : 'format'
			});

			editor.contextMenu.addListener( function()
			{
				return currentBlock() ? { boxformat : CKEDITOR.TRISTATE_OFF } : null;
			});
		}

	}
} );
