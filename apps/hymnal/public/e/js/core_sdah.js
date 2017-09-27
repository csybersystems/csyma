	$(function()
	{
		var SDAH = {};
		(function( app )
		{
			app.init = function()
			{
				app.songFirst = 1;
				app.songLast = 844;
				app.catpg = "";
				app.vtrans = {'transition':'turn','changeHash':false};
				app.ptrans = {'transition':'flip','changeHash':false};
				app.ctrans = {};
				app.getAllTitles();
				app.bindings();
				//app.FullScreen();
			};
			app.bindings = function()
			{
				$(document).on('click','a.groups',app.listSongs);
				$(document).on('click','a.single',app.loadSong);
				$(document).on('click','div.ui-grid-b a',app.goToVerse);
				$(document).on('mobileinit',app.setDefaults);
				$(document).on('ajaxSend',app.showLoading);
				$(document).on('ajaxComplete',app.hideLoading);
				$(document).on('ajaxError',app.errorLoading);
				$(document).on('click','div a.ct',app.changeTheme);
				$(document).on('keypress',app.typeSong);
				window.onerror = function( errorMsg, url, lineNumber )
				{
					alert( errorMsg + ' : ' + url + ' : ' + lineNumber );
				};
			};
			app.typeSong = function()
			{
				$('input[data-type=search]').focus();
			};
			app.showLoading = function()
			{
				$.mobile.loading( 'show' );
			};
			app.hideLoading = function()
			{
				$.mobile.loading( 'hide' );
			};
			app.errorLoading = function()
			{
				$.mobile.loading( 'error' );
			};
			app.setDefaults = function()
			{
				$.extend( $.mobile.loader.prototype.options,
				{
					textVisible:true,
					theme:'f',
					text:'loading'
				});
			};
			app.changeTheme = function()
			{
				$('ul[data-role=listview]').attr('data-theme', $(this).data('theme'));
				$('ul[data-role=listview] li').buttonMarkup({ 'theme':$(this).data('theme') });
			};
			app.listSongs = function()
			{
				app.cat = $(this).data('url');
				app.ptrans[ 'reverse' ] = true;
				app.catpg = 'page_' + app.cat.split('.')[0].split('-')[1];
				app.ptitle = $(this).html();
				if( $( '#' + app.catpg ).length === 1 )
				{
					$.mobile.changePage( $('#' + app.catpg), app.ptrans );
				}
				else
				{
					$.get
					(
						'/hymnal/e/data/' + $(this).data('url'),
						function( data )
						{
							$('<div/>',{'data-role':'page','id':app.catpg}).html
							(
								$('<div/>',{'data-role':'header','data-position':'fixed','data-theme':'g'}).html
								(
									$('<a/>',{'href':'#home','data-icon':'back','data-theme':'b'}).html( 'Back' )
								)
								.append( $('<h3/>').html( app.ptitle ) )
							)
							.append
							(
								$('<div/>',{'data-role':'content'}).html
								(
									$('<ul/>',
									{
										'data-role':'listview',
										'data-theme':'b',
										'data-filter':true,
										'data-inset':true,
										'data-mini':true,
										'data-filter-placeholder':'title or number'
									})
								)
							)
							.appendTo( 'body' );
							$('song', $(data)).each(function()
							{
								$('<li/>').html
								(
									$('<a/>',{'data-url':$('id',this).text() + '.xml','class':'single'})
									.html( $('id',this).text() )
									.append( '. ' )
									.append( $('eTitle',this).text() )
								)
								.appendTo( '#' + app.catpg + ' div ul' );						
							});
							$.mobile.changePage( $('#' + app.catpg), app.ptrans );
						},
						'text'
					);
				}
			};
			app.loadSong = function( options )
			{
				app.catpg = ( $('#' + app.catpg).length === 0 ) ? 'home' : app.catpg;
				app.xmlfile = $.trim( ( options.xmlfile ) ? options.xmlfile : '/hymnal/e/data/s' + $(this).data('url') );
				app.vtrans[ 'reverse' ] = true;
				app.currPage = app.xmlfile.split('.')[1].split('/s')[1];
				app.nextURL  = app.xmlfile.replace(app.currPage + '.xml',(parseInt(app.currPage) + 1) + '.xml');
				app.nextURL  = (parseInt(app.currPage) === app.songLast) ? '#home' : app.nextURL;
				app.prevURL  = app.xmlfile.replace(app.currPage + '.xml',(parseInt(app.currPage) - 1) + '.xml');
				app.prevURL  = (parseInt(app.currPage) === app.songFirst) ? '#home' : app.prevURL;
				if( $('#song_' + app.currPage + '_1').length === 1 )
				{
					$.mobile.changePage( $('#song_' + app.currPage + '_1'), app.vtrans );
				}
				else
				{
					$.ajax(
					{
						url:app.xmlfile,cache:false,dataType:'text',
						success: function( data )
						{
							app.xml = $( data );
							app.stnz = 1;
							app.npages = $(app.xml).find('verse').length * ( 1 + $(app.xml).find('refrain').length );
							app.hasRefrain = $('refrain', app.xml).length === 1;
							!app.hasRefrain || ( app.refrain = $('refrain', app.xml).text() );
							$('verse', app.xml).each(function()
							{
								app.stPref = '#song_' + app.currPage + '_';
								app.sclass = ( app.stnz % 2 === 0 && app.currPage > 695 ) ? {'class':'forall'} : {};
								$('<div/>',{'data-role':'page','id':'song_' + app.currPage + '_' + app.stnz,'class':'page'}).html
								(
									$('<div/>',{'data-role':'content','data-theme':'b'}).html
									(
										$('<div/>',{'data-role':'collapsible','data-content-theme':'b','data-collapsed':false,'class':'verse'}).html
										( 
											$('<h3/>').html( app.currPage + ': ' + $('eTitle',app.xml).text() )
											.append( ' - ' )
											.append( $('<span/>',{'class':'page-count'}).html( app.stnz + '/' + app.npages ) )
										)
										.append( $('<p/>',app.sclass).html( $(this).text().replace(/\t+/,'').replace(/\t+/g,'<br>') ) )
										.append
										(
											$('<div/>',{'class':'ui-grid-b','data-mini':true}).html
											(
												$('<div/>',{'class':'ui-block-a'}).html
												( 
													$('<a/>',
													{
														'data-url':((app.stnz === 1) ? app.prevURL : app.stPref + (app.stnz - 1)),
														'data-role':'button',
														'data-icon':'arrow-l',
														'data-mini':true
													})
													.html( 'Prev' )
												)
											)
											.append
											(
												$('<div/>',{'class':'ui-block-b'}).html
												( 
													$('<a/>',
													{
														'data-url':'#' + app.catpg,
														'data-role':'button',
														'data-icon':'back',
														'data-mini':true
													})
													.html( 'Back' )
												)
											)
											.append
											(
												$('<div/>',{'class':'ui-block-c'}).html
												( 
													$('<a/>',
													{
														'data-url':((app.stnz === app.npages) ? app.nextURL : app.stPref + (app.stnz + 1)),
														'data-role':'button',
														'data-icon':'arrow-r',
														'data-iconpos':'right',
														'data-mini':true
													})
													.html( 'Next' )
												)
											)
										)
									)
								)
								.appendTo( 'body'  );
								app.stnz++;
								if( app.hasRefrain )
								{
									app.stPref = '#song_' + app.currPage + '_';
									$('<div/>',{'data-role':'page','id':'song_' + app.currPage + '_' + app.stnz,'class':'page'}).html
									(
										$('<div/>',{'data-role':'content','data-theme':'b'}).html
										(
											$('<div/>',{'data-role':'collapsible','data-content-theme':'a','data-collapsed':false,'class':'verse'}).html
											(
												$('<h3/>').html( app.currPage + ': ' + $('eTitle',app.xml).text() )
												.append( ' - ' )
												.append
												( 
													$('<span/>',{'class':'page-count'})
													.html( app.stnz + '/' + app.npages + ' [REFRAIN]' )
												)
											)
											.append( $('<p/>',app.sclass).html( app.refrain.replace(/\t+/,'').replace(/\t+/g,'<br>') ) )
											.append
											(
												$('<div/>',{'class':'ui-grid-b','data-mini':true}).html
												(
													$('<div/>',{'class':'ui-block-a'}).html
													(
														$('<a/>',
														{
															'data-url':((app.stnz === 1) ? app.prevURL : app.stPref + (app.stnz - 1)),
															'data-role':'button',
															'data-icon':'arrow-l',
															'data-mini':true
														})
														.html( 'Prev' )
													)
												)
												.append
												(
													$('<div/>',{'class':'ui-block-b'}).html
													(
														$('<a/>',
														{
															'data-url':'#' + app.catpg,
															'data-role':'button',
															'data-icon':'back',
															'data-mini':true
														})
														.html( 'Back' )
													)
												)
												.append
												(
													$('<div/>',{'class':'ui-block-c'}).html
													(
														$('<a/>',
														{
															'data-url':((app.stnz === app.npages) ? app.nextURL : app.stPref + (app.stnz + 1)),
															'data-role':'button',
															'data-icon':'arrow-r',
															'data-iconpos':'right',
															'data-mini':true
														})
														.html( 'Next' )
													)
												)
											)
										)
									)
									.appendTo( 'body' );
									app.stnz++;
								}
							});
							$.mobile.changePage( $('#song_' + app.currPage + '_1'), app.vtrans );
						}
					});
				}
			};
			app.goToVerse = function()
			{
				app.cicon = $(this).data( 'icon' );
				app.ctrans = ( app.cicon === 'home' ) ? app.ptrans : app.vtrans;
				!( app.cicon === 'home' ) || (app.ctrans[ 'reverse' ] = false);
				!( app.cicon === 'arrow-l' ) || (app.ctrans[ 'reverse' ] = false);
				!( app.cicon === 'arrow-r' ) || (app.ctrans[ 'reverse' ] = true);
				if( $(this).data('url').indexOf('.xml') > -1 ) 
				{ 
					app.loadSong( {'xmlfile':$(this).data('url')} );
				}
				else
				{
					$.mobile.changePage( $( $(this).data( 'url' ) ), app.ctrans );
				}
			};
			app.FullScreen = function()
			{
				setTimeout(function() { $(document).fullScreen(true); },50000);
				//window.nativeWindow.stage.displayState = runtime.flash.display.StageDisplayState.FULL_SCREEN_INTERACTIVE;
			};
			app.getAllTitles = function()
			{
				$.get
				(
					'/hymnal/e/data/all_titles.xml',
					function( data )
					{
						$( '<ul/>',
						{ 
							'data-role':'listview',
							'data-theme':'a',
							'data-mini':true,
							'data-filter':true,
							'data-filter-reveal':true,
							'data-filter-placeholder':'number or title',
							'data-inset':true,
							'id':'page_all_titles'
						})
						.insertBefore( 'ul.cats' ); 
						$('song', $(data)).each(function()
						{
							$('<li/>').html
							(
								$('<a/>',{'data-url':$('id',this).text() + '.xml','class':'single'})
								.html( $('id',this).text() )
								.append( '. ' )
								.append( $('eTitle',this).text() )
							)
							.appendTo( '#page_all_titles' );						
						});
						$( '#page_all_titles' ).parent().trigger( 'create' );
					},
					'text'
				);
			};
		})( SDAH );
		SDAH.init();
	});