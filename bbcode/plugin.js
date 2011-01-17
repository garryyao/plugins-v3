/*
 * BBCode (PhpBB variant) plugin for CKEditor.
 * Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

(function()
{
	var tagMap = { 'b' : 'strong', 'u': 'u', 'i' : 'em', 'color' : 'span', 'size' : 'span', 'quote' : 'blockquote', 'code' : 'code', 'url' : 'a', 'email' : 'cke:email', 'img' : 'cke:img', '*' : 'li', 'list' : 'ol' },
			bbCodeMap = { 'strong' : 'b' , 'b' : 'b', 'u': 'u', 'em' : 'i', 'i': 'i', 'code' : 'code', 'cke:img' : 'img', 'li' : '*' },
			stylesMap = { 'color' : 'color', 'size' : 'font-size' },
			attributesMap = { 'url' : 'href', 'email' : 'mailhref', 'quote': 'cite', 'list' : 'listType' };

	var semicolonFixRegex = /\s*(?:;\s*|$)/;
	function serializeStyleText( stylesObject )
	{
		var styleText = '';
		for ( var style in stylesObject )
		{
			var styleVal = stylesObject[ style ],
					text = ( style + ':' + styleVal ).replace( semicolonFixRegex, ';' );

			styleText += text;
		}
		return styleText;
	}

	function parseStyleText( styleText )
	{
		var retval = {};
		( styleText || '' )
				.replace( /&quot;/g, '"' )
				.replace( /\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function( match, name, value )
		{
			retval[ name.toLowerCase() ] = value;
		} );
		return retval;
	}

	var decodeHtml = ( function ()
	{
		var regex = [],
			entities =
			{
				nbsp	: '\u00A0',		// IE | FF
				shy		: '\u00AD',		// IE
				gt		: '\u003E',		// IE | FF |   --   | Opera
				lt		: '\u003C'		// IE | FF | Safari | Opera
			};

		for ( var entity in entities )
			regex.push( entity );

		regex = new RegExp( '&(' + regex.join( '|' ) + ');', 'g' );

		return function ( html )
		{
			return html.replace( regex, function( match, entity )
			{
				return entities[ entity ];
			})
		}
	})();

	CKEDITOR.BBCodeParser = function()
	{
		this._ =
		{
			bbcPartsRegex : /(?:\[([^\/\]=]*?)(?:=([^\]]*?))?\])|(?:\[\/([a-z]{1,16})\])/ig
		};
	};

	CKEDITOR.BBCodeParser.prototype =
	{
		parse : function( bbcode )
		{
			var parts,
					part,
					lastIndex = 0;

			while ( ( parts = this._.bbcPartsRegex.exec( bbcode ) ) )
			{
				var tagIndex = parts.index;
				if ( tagIndex > lastIndex )
				{
					var text = bbcode.substring( lastIndex, tagIndex );
					this.onText( text, 1 );
				}

				lastIndex = this._.bbcPartsRegex.lastIndex;

				/*
				 "parts" is an array with the following items:
				 0 : The entire match for opening/closing tags and line-break;
				 1 : line-break;
				 2 : open of tag excludes option;
				 3 : tag option;
				 4 : close of tag;
				 */

				// Opening tag
				if ( ( part = parts[ 1 ] ) )
				{
					part = part.toLowerCase();

					var tagName = tagMap[ part ],
							attribs = {},
							styles = {},
							optionPart = parts[ 2 ];

					if ( optionPart )
					{
						if ( part == 'list' )
						{
							if ( !isNaN( optionPart ) )
								optionPart = 'decimal';
							else if ( /^[a-z]+$/.test( optionPart ) )
								optionPart = 'lower-alpha';
							else if ( /^[A-Z]+$/.test( optionPart ) )
								optionPart = 'upper-alpha';
						}

						if ( stylesMap[ part ] )
						{
							// Font size represents percentage.
							if ( part == 'size' )
								optionPart += '%';

							styles[ stylesMap[ part ] ] = optionPart;
							attribs.style = serializeStyleText( styles );
						}
						else if ( attributesMap[ part ] )
							attribs[ attributesMap[ part ] ] = optionPart;
					}

					this.onTagOpen( tagName, attribs, CKEDITOR.dtd.$empty[ tagName ] );
				}
				// Closing tag
				else if ( ( part = parts[ 3 ] ) )
					this.onTagClose( tagMap[ part ] );
			}

			if ( bbcode.length > lastIndex )
				this.onText( bbcode.substring( lastIndex, bbcode.length ), 1 );
		}
	};

	var bbCodeTags = { 'b' : 1, 'u' : 1, 'i' : 1, 'color' : 1, 'size' : 1, 'quote' : 1, 'code' : 1, 'list' : 1, '*' : 1, 'url' : 1, 'img' : 1, 'email' : 1 },
			lineBreakInner = { 'list' : 1 },
			lineBreakOutter = { 'list' : 1, '*' : 1, 'quote' : 1 };

	CKEDITOR.htmlParser.BBCodeWriter = CKEDITOR.tools.createClass(
	{
		$ : function()
		{
			this._ =
			{
				output : []
			};
		},

		proto :
		{
			openTag : function( tagName, attributes )
			{
				if ( tagName in bbCodeTags )
				{
					( tagName in  lineBreakOutter ) && this.lineBreak( 1 );
					this.write( '[', tagName );
					var option = attributes.option;
					option && this.write( '=', option );
					this.write( ']' );
					( tagName in  lineBreakInner ) && this.lineBreak( 1 );
				}
				else if ( tagName == 'br' )
					this.lineBreak();
			},

			openTagClose : function()
			{
			},

			attribute : function()
			{
			},

			closeTag : function( tagName )
			{
				if ( tagName in bbCodeTags && tagName != '*' )
				{
					( tagName in  lineBreakInner ) && this.lineBreak( 1 );
					this.write( '[/', tagName, ']' );
					( tagName in  lineBreakOutter ) && this.lineBreak( 1 );
				}
			},

			text : function( text )
			{
				this.write( text );
			},

			/**
			 * Writes a comment.
			 * @param {String} comment The comment text.
			 * @example
			 * // Writes "&lt;!-- My comment --&gt;".
			 * writer.comment( ' My comment ' );
			 */
			comment : function()
			{
			},

			lineBreak : function( formatBreak )
			{
				if ( ! ( formatBreak && this._.lineBreak ) )
					this.write( '\n' );
			},

			write : function()
			{
				var data = Array.prototype.join.call( arguments, '' );
				this._.lineBreak = /[\r\n]$/.test( data );
				this._.output.push( data );
			},

			reset : function()
			{
				this._.output = [];
				this._.lineBreak = 0;
			},

			getHtml : function( reset )
			{
				var bbcode = this._.output.join( '' );

				if ( reset )
					this.reset();

				return decodeHtml ( bbcode );
			}
		}
	});

	CKEDITOR.plugins.add( 'bbcode',
	  {
		  requires : [ 'sourcearea', 'htmldataprocessor' ],
		  init : function( editor )
		  {
			  function BBCodeToHtml( code )
			  {
				  var fragment = CKEDITOR.htmlParser.fragment.fromHtml( CKEDITOR.tools.htmlEncode( code ), false, new CKEDITOR.BBCodeParser() ),
						  writer = new CKEDITOR.htmlParser.basicWriter();

				  fragment.writeHtml( writer, dataFilter );
				  return writer.getHtml( true );
			  }

			  var dataFilter = new CKEDITOR.htmlParser.filter();
			  dataFilter.addRules(
			  {
				  elements :
				  {
					  'blockquote' : function( element )
					  {
						  var citeText = element.attributes.cite;
						  if ( citeText )
						  {
							  var quoted = new CKEDITOR.htmlParser.element( 'div' ),
									  cite = new CKEDITOR.htmlParser.element( 'cite' );
							  cite.add( new CKEDITOR.htmlParser.text( citeText.replace( /^"|"$/g, '' ) ) )
							  quoted.children = element.children;
							  element.children = [ cite, quoted  ];
							  delete element.attributes.cite;
						  }
					  },
					  'cke:img' : function( element )
					  {
						  element.name = 'img';
						  element.attributes.src = element.children[ 0 ].value;
						  element.children = [];
					  },
					  'cke:email' : function ( element )
					  {
						  element.name = 'a';
						  element.attributes.href = 'mailto:' + element.children[ 0 ].value;
					  },
					  'ol' : function ( element )
					  {
						  if ( element.attributes.listType )
						  {
							  if ( element.attributes.listType != 'decimal' )
								  element.attributes.style = 'list-style-type:' + element.attributes.listType;
						  }
						  else
							  element.name = 'ul';

						  delete element.attributes.listType;
					  },
					  a : function( element )
					  {
						  if ( !element.attributes.href )
							  element.attributes.href = element.children[ 0 ].value
					  }
				  }
			  } );

			  editor.dataProcessor.htmlFilter.addRules(
			  {
				elements :
				{
					$ : function( element )
					{
						var attributes = element.attributes,
								style = parseStyleText( attributes.style ),
								value;

						var tagName = element.name;
						if ( tagName in bbCodeMap )
							tagName = bbCodeMap[ tagName ];
						else if ( tagName == 'span' )
						{
							if ( value = style.color )
								tagName = 'color';
							else if ( value = style[ 'font-size' ] )
							{
								var percentValue = value.match( /(\d+)%$/ );
								if ( percentValue )
								{
									value = percentValue[ 1 ];
									tagName = 'size';
								}
							}
						}
						else if ( tagName == 'ol' || tagName == 'ul' )
						{
							if ( value = style[ 'list-style-type'] )
							{
								switch ( value )
								{
									case 'lower-alpha':
										value = 'a';
										break;
									case 'upper-alpha':
										value = 'A';
										break;
								}
							}
							else if ( tagName == 'ol' )
								value = 1;

							tagName = 'list';
						}
						else if ( tagName == 'blockquote' )
						{
							try
							{
								var cite = element.children[ 0 ],
										quoted = element.children[ 1 ],
										citeText = cite.name == 'cite' && cite.children[ 0 ].value;

								if ( citeText )
								{
									value = '"' + citeText + '"';
									element.children = quoted.children;
								}

							}
							catch( er )
							{
							}

							tagName = 'quote';
						}
						else if ( tagName == 'a' )
						{
							if ( value = attributes.href )
							{
								if ( value.indexOf( 'mailto:' ) !== -1 )
								{
									tagName = 'email';
									value = '';
								}
								else
								{
									var singleton = element.children.length == 1 && element.children[ 0 ];
									if ( singleton
											&& singleton.type == CKEDITOR.NODE_TEXT
											&& singleton.value == value )
										value = '';

									tagName = 'url';
								}
							}
						}
						else if ( tagName == 'img' )
						{
							element.isEmpty = 0;
							element.children = [ new CKEDITOR.htmlParser.text( attributes.src ) ];
						}

						element.name = tagName;
						value && ( element.attributes.option = value );
					}
				}
			  }, 1 );

			  editor.dataProcessor.writer = new CKEDITOR.htmlParser.BBCodeWriter();

			  editor.on( 'editingBlockReady', function ()
			  {
				  var wysiwyg = editor._.modes[ 'wysiwyg' ];
				  wysiwyg.loadData = CKEDITOR.tools.override( wysiwyg.loadData, function( org )
				  {
					  return function( data )
					  {
						  return ( org.call( this, BBCodeToHtml( data ) ) );
					  };
				  } );
			  } );

		  }
	  } );

})();


