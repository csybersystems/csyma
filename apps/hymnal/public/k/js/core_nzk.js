	$(function()
	{
		var core = {};
		(function( app )
		{
			app.init = function()
			{
				$.ajax({url:"/apps/hymnal/k/data/songs.xml",dataType:'xml',cache:false,success: app.listSongs});
				app.fs();//app.FullScreen(); //$(window).fullScreen();
				app.songFirst = 1;
				app.songLast  = 220;
				app.transReverse = false;
				app.transition = {'transition':'flip','reverse':false,'changeHash':false};
				app.bindings();						
			};
			app.bindings = function()
			{
				$(document).on('click','a.nzk',app.loadSong);
				$(document).on('click','div.ui-grid-b a[data-url$=xml]',app.loadSong);
				$(document).on('click','a[data-url*=song_]',app.nextSong);
				$(document).on('swipeleft','div.page',app.nextPage);
				$(document).on('swiperight','div.page',app.prevPage);
				$(document).on('tap','div.page p',app.homePage);
				$(document).on('ajaxStart',app.loadingShow);
				$(document).on('ajaxStop ajaxError',app.loadingHide);
				$(document).on('keypress',app.typeSong);
				$(document).on("vmouseover", function () { });
				$(document).on('click','div.ui-grid-b a',app.gotoPage);
				$(document).on('mobileinit',app.setDefaults);
				$(document).on('hover','div.ui-grid-b a',app.setTrans);
				$(document).on('click',app.fs);
				//$(document).on('mousewheel DOMMouseScroll mouseenter mouseleave mouseover mouseout hover vmouseover','li',app.speedUp);
			};
			app.listSongs = function( data )
			{
				var xml = data;
				$('#home div.content-primary').html
				(
					$('<ul/>', 
					{
						'data-role':"listview",
						'data-filter':true,
						'data-inset':true,
						'data-theme':"b",
						'data-filter-placeholder':"Wimbo au nambari",
						'data-mini':true
					})
				);
				$(xml).find('song').each(function() 
				{
					$('<li/>').html
					(
						$('<a/>',{'data-url':'/hymnal/k/data/' + $('id',this).text() + '.xml', 'class':'nzk'})
						.html( $('id',this).text() + '. ' + $('title',this).text() )
						.append( ' ( ' )
						.append( $('<i/>').html( $('englishTitle',this).text() ) )
						.append( ' ) ' )
					)
					.appendTo( '#home div.content-primary ul' );
				});
				$('#home div.content-primary').trigger( 'create' );	
			};
			app.loadSong = function( e )
			{
				e.preventDefault();
				e.stopImmediatePropagation();
				app.currPage = $(this).data('url').split('/').pop().split('.')[0];
				app.nextURL  = $(this).data('url').replace(app.currPage + '.xml',(parseInt(app.currPage) + 1) + '.xml');
				app.nextURL  = (parseInt(app.currPage) === app.songLast) ? '#home' : app.nextURL;
				app.prevURL  = $(this).data('url').replace(app.currPage + '.xml',(parseInt(app.currPage) - 1) + '.xml');
				app.prevURL  = (parseInt(app.currPage) === app.songFirst) ? '#home' : app.prevURL;
				if( $('#page_' + app.currPage).length === 1 )
				{
					$.mobile.changePage( $('#song_' + app.currPage + '_1') );
				}
				else
				{
					$.ajax(
					{
						url:$(this).data('url'),cache:false,dataType:'xml',
						success: function( data )
						{
							app.xml = data;
							$('#home').after('<span id="page_' + app.currPage + '"/>');
							app.stnz = 1;
							app.npages = $(app.xml).find('verse').length * ( 1 + $(app.xml).find('refrain').length );
							app.hasRefrain = $('refrain', app.xml).length === 1;
							!app.hasRefrain || ( app.refrain = $('refrain', app.xml).text() );
							$('verse', app.xml).each(function()
							{
								app.stPref = '#song_' + app.currPage + '_';
								$('<div/>',{'data-role':'page','id':'song_' + app.currPage + '_' + app.stnz,'class':'page'}).html
								(
									$('<div/>',{'data-role':'content','data-theme':'b'}).html
									(
										$('<div/>',{'data-role':'collapsible','data-content-theme':'e','data-collapsed':false,'class':'verse'}).html
										( 
											$('<h3/>').html( app.currPage + ': ' + $('title',app.xml).text() )
											.append( ' - ' )
											.append( $('<span/>',{'class':'page-count'}).html( app.stnz + '/' + app.npages ) )
											.append( ' - ' )
											.append( $('<i/>').html( $('englishTitle',app.xml).text() ) )
										)
										.append( $('<p/>').html( $(this).text().replace(/\t+/,'').replace(/\t+/g,'<br>') ) )
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
													.html( 'Back' )
												)
											)
											.append
											(
												$('<div/>',{'class':'ui-block-b'}).html
												( 
													$('<a/>',
													{
														'data-url':'#home',
														'data-role':'button',
														'data-icon':'home',
														'data-mini':true
													})
													.html( 'Home' )
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
								.appendTo( '#page_' + app.currPage );
								app.stnz++;
								if( app.hasRefrain )
								{
									app.stPref = '#song_' + app.currPage + '_';
									$('<div/>',{'data-role':'page','id':'song_' + app.currPage + '_' + app.stnz,'class':'page'}).html
									(
										$('<div/>',{'data-role':'content','data-theme':'b'}).html
										(
											$('<div/>',{'data-role':'collapsible','data-content-theme':'e','data-collapsed':false,'class':'verse'}).html
											(
												$('<h3/>').html( app.currPage + ': ' + $('title',app.xml).text() )
												.append( ' - ' )
												.append
												( 
													$('<span/>',{'class':'page-count'})
													.html( app.stnz + '/' + app.npages + ' [REFRAIN]' )
												)
												.append( ' - ' )
												.append( $('<i/>').html( $('englishTitle',app.xml).text() ) )
											)
											.append( $('<p/>').html( app.refrain.replace(/\t+/,'').replace(/\t+/g,'<br>') ) )
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
														.html( 'Back' )
													)
												)
												.append
												(
													$('<div/>',{'class':'ui-block-b'}).html
													(
														$('<a/>',
														{
															'data-url':'#home',
															'data-role':'button',
															'data-icon':'home',
															'data-mini':true
														})
														.html( 'Home' )
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
									.appendTo( '#page_' + app.currPage );
									app.stnz++;
								}
							});
							$.mobile.changePage( $('#song_' + app.currPage + '_1') );
						}
					});
				}
			};
			app.nextSong = function(e)
			{
				e.preventDefault();
				$.mobile.changePage( $('#' + $(this).data('url').split('#').pop()), {'transition':'flip','changeHash':false} );
			};
			app.prevPage = function()
			{
				$('div.ui-grid-b a:first', this).click();
			};
			app.nextPage = function()
			{
				$('div.ui-grid-b a:last', this).click();
			};
			app.homePage = function(e)
			{
				$('div.ui-grid-b a:eq(1)', this).click();
			};
			app.loadingShow = function()
			{
				$.mobile.loading( 'show' );
			};
			app.loadingHide = function()
			{
				$.mobile.loading( 'hide' );
			};
			app.FullScreen = function()
			{
				/*window.nativeWindow.stage.displayState = runtime.flash.display.StageDisplayState.FULL_SCREEN;
				window.nativeWindow.stage.displayState = runtime.flash.display.StageDisplayState.FULL_SCREEN_INTERACTIVE;*/
				$(document).fullScreen(true);
			};
			app.typeSong = function()
			{
				$('input[data-type=search]').focus();
			};
			app.gotoPage = function(e)
			{
				e.preventDefault();
				app.pageTransition = 
				{ 
					'arrow-l':{'transition':'flip','reverse':false,'changeHash':false},
					'home':{'tranistion':'slideup','reverse':false,'changeHash':false},
					'arrow-r':{'transition':'flip','reverse':true,'changeHash':false}
				}
				$.mobile.changePage( $('#' + $(this).data('url').split('#').pop() ), app.pageTransition[ $(this).data( 'icon' ) ]);
			};
			app.setDefaults = function()
			{
				$.extend( $.mobile,
				{
					defaultPageTransition:'flip',
					defaultDialogTransition:'fade',
					allowCrossDomainPages:true,
					ajaxEnabled:true
				});
			};
			app.setTrans = function()
			{
				app.thisTrans = 'flip';
				switch( $(this).data('icon') )
				{
					case 'arrow-l':
						app.transReverse = true;
						break;
					case 'arrow-r':
						app.transReverse = false;
						break;
					case 'home':
						app.transReverse = false;
						app.thisTrans = 'slideup';
						break;
				}
				app.transition = {'transition':app.thisTrans,'reverse':app.transReverse,'changeHash':false}			
			};
			app.speedUp = function( e )
			{
				if( $.inArray(e.type,['mouseenter','mouseleave','mouseover','mouseout','hover']) > -1 )
				{
					air.Introspector.Console.log( e.type );
					return e.preventDefault();
				}
				air.Introspector.Console.log( 'Other: ' + e.type );
			};
			app.fs = function()
			{
				if (app.RunPrefixMethod(document, "FullScreen") || app.RunPrefixMethod(document, "IsFullScreen")) 
				{
					app.RunPrefixMethod(document, "CancelFullScreen");
				}
				else 
				{
					app.RunPrefixMethod(this, "RequestFullScreen");
				}
			};
			app.RunPrefixMethod = function(obj,method)
			{
				var pfx = ["webkit", "moz", "ms", "o", ""];
				var p = 0, m, t;
				while (p < pfx.length && !obj[m]) 
				{
					m = method;
					if (pfx[p] == "") 
					{
						m = m.substr(0,1).toLowerCase() + m.substr(1);
					}
					m = pfx[p] + m;
					t = typeof obj[m];
					if (t != "undefined") 
					{
						pfx = [pfx[p]];
						return (t == "function" ? obj[m]() : obj[m]);
					}
					p++;
				}
			};
		})( core );
		core.init();
	});
/*	
	(function( $ )
	{
		$.fn.fullWidth = function()
		{
			return this.each(function()
			{
				var pw = $(window).width();
				var pr = $(this).width();
				alert( pw + " ::: " + pr );
			});
		};
		$.fn.fullScreen = function()
		{
			return this.each(function()
			{
				this.moveTo(0, 0);
				this.resizeTo(screen.availWidth,screen.availHeight);
			});
		};
	})( jQuery );*/