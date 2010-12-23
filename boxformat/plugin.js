/**
 * Dialog for managing paragraph formatting.
 */
CKEDITOR.plugins.add( 'boxformat',
{
	init: function( editor )
	{
		function getPopupDialogValue( dialogName, callback )
		{
			var onOk = function()
			{
				releaseHandlers( this );
				callback( this, this._.parentDialog );
				this._.parentDialog.changeFocus( true );
			};

			var onCancel = function()
			{
				releaseHandlers( this );
				this._.parentDialog.changeFocus();
			};

			var releaseHandlers = function( dialog )
			{
				dialog.removeListener( 'ok', onOk );
				dialog.removeListener( 'cancel', onCancel );
			};

			var bindToDialog = function( dialog )
			{
				dialog.on( 'ok', onOk );
				dialog.on( 'cancel', onCancel );
			};

			editor.execCommand( dialogName );

			if ( editor._.storedDialogs.colordialog )
				bindToDialog( editor._.storedDialogs.colordialog );
			else
			{
				CKEDITOR.on( 'dialogDefinition', function( e )
				{
					if ( e.data.name != dialogName )
						return;

					var definition = e.data.definition;

					e.removeListener();
					definition.onLoad = CKEDITOR.tools.override( definition.onLoad, function( orginal )
					{
						return function()
						{
							bindToDialog( this );
							definition.onLoad = orginal;
							if ( typeof orginal == 'function' )
								orginal.call( this );
						};
					} );
				} );
			}
		}

		function dashToCamel( name )
		{
			return name.replace( /-./g, function( match ) { return match.substr( 1 ).toUpperCase(); } );
		}

		function cssLengthField( name, label )
		{
			return {
				type : 'text',
				id : dashToCamel( name ),
				label : label,
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
						var unitField = this.getDialog().getContentElement( 'info', dashToCamel( name ) + 'Unit' ),
							unit = unitField.getValue() || unitField.getElement().getText();
						element.setStyle( name, this.getValue() + unit );
					}
					else
						element.removeStyle( name );
				},
				onChange : preview
			};
		}

		function cssLengthUnitChoose( name, label )
		{
			var units = /em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz/;
			return {
				type : 'select',
				id :  dashToCamel( name ) + 'Unit',
				label : label,
				labelStyle: 'visibility:hidden',
				style: 'margin-left: 10px',
				'default' : 'pixels',
				items :
				[
					[ 'Pixels' , 'px'],
					[ 'Ex' , 'ex'],
					[ 'Em' , 'em'],
					[ 'Inches' , 'in'],
					[ 'Points' , 'pt'],
					[ 'Centimeters' , 'cm'],
					[ 'Millimeters' , 'mm']
					[ 'Picas' , 'pc']
				],
				setup : function( element )
				{
					var widthMatch = units.exec( element.getStyle( name ) );
						this.setValue( widthMatch ? widthMatch[ 0 ] : 'px' );
				},
				onChange : preview
			};
		}

		function cssLengthUnitLabel( name, label )
		{
			var units = /^[.\d]+(.*)$/;
			return {
				type : 'html',
				id :  dashToCamel( name ) + 'Unit',
				label : label,
				labelStyle: 'visibility:hidden',
				style : 'display:block;margin: 1em 10px 0',
				html : '',
				setup : function( element )
				{
					var match = units.exec( element.getStyle( name ) );
					this.getElement().setText( match ? match[ 1 ] : 'px' );
				}
			};
		}

		function currentBlock()
		{
			var selection = editor.getSelection(),
				path = new CKEDITOR.dom.elementPath( selection.getStartElement() );

			return path.block;
		}

		function preview()
		{
			var dialog = this.getDialog();
			dialog.commitContent( CKEDITOR.document.getById( 'cke_boxformat_preview' ) );
		}

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
					 title : 'Box Formatting',
					 expand : true,
					 elements :
						   [
							   {
								   type : 'hbox',
								   widths : [ '40%', '60%' ],
								   children :
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
													   cssLengthField( 'border-width', 'Border Width'),
													   cssLengthUnitChoose( 'border-width', 'Border Width Unit' )
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
												   },
												   onChange : preview
											   }
										   ]
									   },
									   {
										   type : 'vbox',
										   padding : 1,
										   children :
										   [
											   {
												   type : 'hbox',
												   padding : 0,
												   widths : [ '60%', '40%' ],
												   children :
												   [
													   {
														   type : 'text',
														   id : 'bgColor',
														   label : 'Box Background Color',
														   'default' : '',
														   setup : function( element )
														   {
															   this.setValue( element.getStyle( 'background-color' ) || '' );
														   },
														   commit : function( element )
														   {
															   var val = this.getValue();

															   if ( val )
																   element.setStyle( 'background-color', this.getValue() );
															   else
																   element.removeStyle( 'background-color' );
														   },
														   onChange : preview
													   },
													   {
														   type : 'button',
														   id : 'bgColorChoose',
														   "class" : 'colorChooser',
														   label : 'Pick Color',
														   onClick : function()
														   {
															   var self = this;
															   getPopupDialogValue( 'colordialog', function( colorDialog )
															   {
																   self.getDialog().getContentElement( 'info', 'bgColor' ).setValue(
																	   colorDialog.getContentElement( 'picker', 'selectedColor' ).getValue()
																   );
															   } );
														   }
													   }
												   ]
											   },
											   {
												   type : 'hbox',
												   padding : 0,
												   widths : [ '60%', '40%' ],
												   children :
												   [
													   {
														   type : 'text',
														   id : 'borderColor',
														   label : 'Box Border Color',
														   'default' : '',
														   setup : function( element )
														   {
															   this.setValue( element.getStyle( 'border-color' ) || '' );
														   },
														   commit : function( element )
														   {
															   var val = this.getValue();
															   if ( val )
																   element.setStyle( 'border-color', this.getValue() );
															   else
																   element.removeStyle( 'border-color' );
														   },
														   onChange : preview
													   },
													   {
														   type : 'button',
														   id : 'borderColorChoose',
														   "class" : 'colorChooser',
														   label : 'Pick Color',
														   onClick : function()
														   {
															   var self = this;
															   getPopupDialogValue( 'colordialog', function( colorDialog )
															   {
																   self.getDialog().getContentElement( 'info', 'borderColor' ).setValue(
																	   colorDialog.getContentElement( 'picker', 'selectedColor' ).getValue()
																   );
															   } );
														   }
													   }
												   ]
											   }
										   ]
									   }
								   ]
							   },
							   {
								   type : 'hbox',
								   padding : 0,
								   widths : [ '50%', '50%' ],
								   children :
								   [
									   {
										   type :  'vbox',
										   id : 'margins',
										   padding : 1,
										   children :
										   [
											   {
												   type : 'html',
												   style : 'display: block; margin-bottom: 10px',
												   html : 'Margins'
											   },
											   {
												   type : 'hbox',
												   padding : 0,
												   widths : [ '50%', '50%' ],
												   children :
												   [
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'margin-left', 'Left'),
															   cssLengthUnitLabel( 'margin-left', 'Left Length Unit' )
														   ]
													   },
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'margin-right', 'Right'),
															   cssLengthUnitLabel( 'margin-right', 'Right Length Unit' )
														   ]
													   }
												   ]
											   },
											   {
												   type : 'hbox',
												   padding : 0,
												   widths : [ '50%', '50%' ],
												   children :
												   [
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'margin-top', 'Top'),
															   cssLengthUnitLabel( 'margin-top', 'Top Length Unit' )
														   ]
													   },
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'margin-bottom', 'Bottom'),
															   cssLengthUnitLabel( 'margin-bottom', 'Bottom Length Unit' )
														   ]
													   }
												   ]
											   }
										   ]
									   },
									   {
										   type :  'vbox',
										   id : 'paddings',
										   padding : 1,
										   children :
										   [
											   {
												   type : 'html',
												   style : 'display: block; margin-bottom: 10px',
												   html : 'Paddings'
											   },
											   {
												   type : 'hbox',
												   padding : 0,
												   widths : [ '50%', '50%' ],
												   children :
												   [
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'padding-left', 'Left'),
															   cssLengthUnitLabel( 'padding-left', 'Left Length Unit' )
														   ]
													   },
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'padding-right', 'Right'),
															   cssLengthUnitLabel( 'padding-right', 'Right Length Unit' )
														   ]
													   }
												   ]
											   },
											   {
												   type : 'hbox',
												   padding : 0,
												   widths : [ '50%', '50%' ],
												   children :
												   [
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'padding-top', 'Top'),
															   cssLengthUnitLabel( 'padding-top', 'Top Length Unit' )
														   ]
													   },
													   {
														   type : 'hbox',
														   padding : 0,
														   widths : [ '60%', '40%' ],
														   children :
														   [
															   cssLengthField( 'padding-bottom', 'Bottom'),
															   cssLengthUnitLabel( 'padding-bottom', 'Bottom Length Unit' )
														   ]
													   }
												   ]
											   }
										   ]
									   }
								   ]
							   },
							   {
								   type :  'vbox',
								   id : 'dimension',
								   width : '40%',
								   padding : 1,
								   children :
								   [
									   {
										   type : 'html',
										   style : 'display: block; margin-bottom: 10px',
										   html : 'Dimension'
									   },
									   {
										   type : 'hbox',
										   padding : 0,
										   widths : [ '80%', '20%' ],
										   children :
										   [
											   cssLengthField( 'width', 'Width'),
											   cssLengthUnitChoose( 'width', 'Width Unit' )
										   ]
									   },
									   {
										   type : 'hbox',
										   padding : 0,
										   widths : [ '80%', '20%' ],
										   children :
										   [
											   cssLengthField( 'height', 'Height'),
											   cssLengthUnitChoose( 'height', 'Height Unit' )
										   ]
									   }
								   ]
							   },
							   {
								   type : 'vbox',
								   height : 150,
								   children :
								   [
									   {
										   id : 'preview',
										   type : 'html',
										   label : 'Preview',
										   style : 'background-color:#fff;border: 2px ridge black;',
										   html : '<div><div id="cke_boxformat_preview" style="white-space: normal;overflow:auto">' +
												   'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. '+
												   'Maecenas feugiat consequat diam. Maecenas metus. Vivamus diam purus, cursus a, commodo non, facilisis vitae, '+
												   'nulla. Aenean dictum lacinia tortor. Nunc iaculis, nibh non iaculis aliquam, orci felis euismod neque, sed ornare massa mauris sed velit. Nulla pretium mi et risus. Fusce mi pede, tempor id, cursus ac, ullamcorper nec, enim. Sed tortor. Curabitur molestie. Duis velit augue, condimentum at, ultrices a, luctus ut, orci. Donec pellentesque egestas eros. Integer cursus, augue in cursus faucibus, eros pede bibendum sem, in tempus tellus justo quis ligula. Etiam eget tortor. Vestibulum rutrum, est ut placerat elementum, lectus nisl aliquam velit, tempor aliquam eros nunc nonummy metus. In eros metus, gravida a, gravida sed, lobortis id, turpis. Ut ultrices, ipsum at venenatis fringilla, sem nulla lacinia tellus, eget aliquet turpis mauris non enim. Nam turpis. Suspendisse lacinia. Curabitur ac tortor ut ipsum egestas elementum. Nunc imperdiet gravida mauris.' +
												   '</div></div>',
										   setup : function( element )
										   {
											   var previewArea = this.getElement();
											   previewArea.setHtml( element.getOuterHtml());
											   var previewBox = previewArea.getFirst();
											   previewBox.setAttribute( 'id', 'cke_boxformat_preview' );
											   previewBox.setStyles( { 'white-space' : 'normal', overflow: 'auto' });
										   }
									   }
									]
							 	}
						   ]
				  }
			],
			onOk : function()
			{
				this.commitContent( this.selectedElement );
			},
			onShow : function()
			{
				this.setupContent( this.selectedElement = currentBlock() );
			},
			onHide : function()
			{
				CKEDITOR.document.getById( 'cke_boxformat_preview' )
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

		// If the "contextmenu" plugin is loaded, register the listeners.
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
