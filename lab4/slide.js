(function( $, undefined ) {

    /*
     * Slider object.
     */
    $.Slider 				= function( options, element ) {

        this.$el	= $( element );

        this._init( options );

    };

    $.Slider.defaults 		= {
        current		: 0, 	// index of current slide
        bgincrement	: 50,	// increment the bg position (parallax effect) when sliding
        autoplay	: false,// slideshow on / off
        interval	: 4000  // time between transitions
    };

    $.Slider.prototype 	= {
        _init 				: function( options ) {

            this.options 		= $.extend( true, {}, $.Slider.defaults, options );

            this.$slides		= this.$el.children('div.da-slide');
            this.slidesCount	= this.$slides.length;

            this.current		= this.options.current;

            if( this.current < 0 || this.current >= this.slidesCount ) {

                this.current	= 0;

            }

            this.$slides.eq( this.current ).addClass( 'da-slide-current' );

            var $navigation		= $( '<nav class="da-dots"/>' );
            for( var i = 0; i < this.slidesCount; ++i ) {

                $navigation.append( '<span/>' );

            }
            $navigation.appendTo( this.$el );

            this.$pages			= this.$el.find('nav.da-dots > span');
            this.$navNext		= this.$el.find('span.da-arrows-next');
            this.$navPrev		= this.$el.find('span.da-arrows-prev');

            this.isAnimating	= false;

            this.bgpositer		= 0;

            this.cssAnimations	= Modernizr.cssanimations;
            this.cssTransitions	= Modernizr.csstransitions;

            if( !this.cssAnimations || !this.cssAnimations ) {

                this.$el.addClass( 'da-slider-fb' );

            }

            this._updatePage();

            // load the events
            this._loadEvents();

            // slideshow
            if( this.options.autoplay ) {

                this._startSlideshow();

            }

        },
        _navigate			: function( page, dir ) {

            var $current	= this.$slides.eq( this.current ), $next, _self = this;

            if( this.current === page || this.isAnimating ) return false;

            this.isAnimating	= true;

            // check dir
            var classTo, classFrom, d;

            if( !dir ) {

                ( page > this.current ) ? d = 'next' : d = 'prev';

            }
            else {

                d = dir;

            }

            if( this.cssAnimations && this.cssAnimations ) {

                if( d === 'next' ) {

                    classTo		= 'da-slide-toleft';
                    classFrom	= 'da-slide-fromright';
                    ++this.bgpositer;

                }
                else {

                    classTo		= 'da-slide-toright';
                    classFrom	= 'da-slide-fromleft';
                    --this.bgpositer;

                }

                this.$el.css( 'background-position' , this.bgpositer * this.options.bgincrement + '% 0%' );

            }

            this.current	= page;

            $next			= this.$slides.eq( this.current );

            if( this.cssAnimations && this.cssAnimations ) {

                var rmClasses	= 'da-slide-toleft da-slide-toright da-slide-fromleft da-slide-fromright';
                $current.removeClass( rmClasses );
                $next.removeClass( rmClasses );

                $current.addClass( classTo );
                $next.addClass( classFrom );

                $current.removeClass( 'da-slide-current' );
                $next.addClass( 'da-slide-current' );

            }

            // fallback
            if( !this.cssAnimations || !this.cssAnimations ) {

                $next.css( 'left', ( d === 'next' ) ? '100%' : '-100%' ).stop().animate( {
                    left : '0%'
                }, 1000, function() {
                    _self.isAnimating = false;
                });

                $current.stop().animate( {
                    left : ( d === 'next' ) ? '-100%' : '100%'
                }, 1000, function() {
                    $current.removeClass( 'da-slide-current' );
                });

            }

            this._updatePage();

        },
        _updatePage			: function() {

            this.$pages.removeClass( 'da-dots-current' );
            this.$pages.eq( this.current ).addClass( 'da-dots-current' );

        },
        _startSlideshow		: function() {

            var _self	= this;

            this.slideshow	= setTimeout( function() {

                var page = ( _self.current < _self.slidesCount - 1 ) ? page = _self.current + 1 : page = 0;
                _self._navigate( page, 'next' );

                if( _self.options.autoplay ) {

                    _self._startSlideshow();

                }

            }, this.options.interval );

        },
        page				: function( idx ) {

            if( idx >= this.slidesCount || idx < 0 ) {

                return false;

            }

            if( this.options.autoplay ) {

                clearTimeout( this.slideshow );
                this.options.autoplay	= false;

            }

            this._navigate( idx );

        },
        _loadEvents			: function() {

            var _self = this;

            this.$pages.on( 'click.cslider', function( event ) {

                _self.page( $(this).index() );
                return false;

            });

            this.$navNext.on( 'click.cslider', function( event ) {

                if( _self.options.autoplay ) {

                    clearTimeout( _self.slideshow );
                    _self.options.autoplay	= false;

                }

                var page = ( _self.current < _self.slidesCount - 1 ) ? page = _self.current + 1 : page = 0;
                _self._navigate( page, 'next' );
                return false;

            });

            this.$navPrev.on( 'click.cslider', function( event ) {

                if( _self.options.autoplay ) {

                    clearTimeout( _self.slideshow );
                    _self.options.autoplay	= false;

                }

                var page = ( _self.current > 0 ) ? page = _self.current - 1 : page = _self.slidesCount - 1;
                _self._navigate( page, 'prev' );
                return false;

            });

            if( this.cssTransitions ) {

                if( !this.options.bgincrement ) {

                    this.$el.on( 'webkitAnimationEnd.cslider animationend.cslider OAnimationEnd.cslider', function( event ) {

                        if( event.originalEvent.animationName === 'toRightAnim4' || event.originalEvent.animationName === 'toLeftAnim4' ) {

                            _self.isAnimating	= false;

                        }

                    });

                }
                else {

                    this.$el.on( 'webkitTransitionEnd.cslider transitionend.cslider OTransitionEnd.cslider', function( event ) {

                        if( event.target.id === _self.$el.attr( 'id' ) )
                            _self.isAnimating	= false;

                    });

                }

            }

        }
    };

    var logError 			= function( message ) {
        if ( this.console ) {
            console.error( message );
        }
    };

    $.fn.cslider			= function( options ) {

        if ( typeof options === 'string' ) {

            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function() {

                var instance = $.data( this, 'cslider' );

                if ( !instance ) {
                    logError( "cannot call methods on cslider prior to initialization; " +
                        "attempted to call method '" + options + "'" );
                    return;
                }

                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
                    logError( "no such method '" + options + "' for cslider instance" );
                    return;
                }

                instance[ options ].apply( instance, args );

            });

        }
        else {

            this.each(function() {

                var instance = $.data( this, 'cslider' );
                if ( !instance ) {
                    $.data( this, 'cslider', new $.Slider( options, this ) );
                }
            });

        }

        return this;

    };

})( jQuery );


!function(e){function t(){var e=location.href;return hashtag=-1!==e.indexOf("#prettyPhoto")?decodeURI(e.substring(e.indexOf("#prettyPhoto")+1,e.length)):!1,hashtag&&(hashtag=hashtag.replace(/<|>/g,"")),hashtag}function i(){"undefined"!=typeof theRel&&(location.hash=theRel+"/"+rel_index+"/")}function p(){-1!==location.href.indexOf("#prettyPhoto")&&(location.hash="prettyPhoto")}function o(e,t){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var i="[\\?&]"+e+"=([^&#]*)",p=new RegExp(i),o=p.exec(t);return null==o?"":o[1]}e.prettyPhoto={version:"3.1.6"},e.fn.prettyPhoto=function(a){function s(){e(".pp_loaderIcon").hide(),projectedTop=scroll_pos.scrollTop+(I/2-f.containerHeight/2),projectedTop<0&&(projectedTop=0),$ppt.fadeTo(settings.animation_speed,1),$pp_pic_holder.find(".pp_content").animate({height:f.contentHeight,width:f.contentWidth},settings.animation_speed),$pp_pic_holder.animate({top:projectedTop,left:j/2-f.containerWidth/2<0?0:j/2-f.containerWidth/2,width:f.containerWidth},settings.animation_speed,function(){$pp_pic_holder.find(".pp_hoverContainer,#fullResImage").height(f.height).width(f.width),$pp_pic_holder.find(".pp_fade").fadeIn(settings.animation_speed),isSet&&"image"==h(pp_images[set_position])?$pp_pic_holder.find(".pp_hoverContainer").show():$pp_pic_holder.find(".pp_hoverContainer").hide(),settings.allow_expand&&(f.resized?e("a.pp_expand,a.pp_contract").show():e("a.pp_expand").hide()),!settings.autoplay_slideshow||P||v||e.prettyPhoto.startSlideshow(),settings.changepicturecallback(),v=!0}),m(),a.ajaxcallback()}function n(t){$pp_pic_holder.find("#pp_full_res object,#pp_full_res embed").css("visibility","hidden"),$pp_pic_holder.find(".pp_fade").fadeOut(settings.animation_speed,function(){e(".pp_loaderIcon").show(),t()})}function r(t){t>1?e(".pp_nav").show():e(".pp_nav").hide()}function l(e,t){if(resized=!1,d(e,t),imageWidth=e,imageHeight=t,(k>j||b>I)&&doresize&&settings.allow_resize&&!$){for(resized=!0,fitting=!1;!fitting;)k>j?(imageWidth=j-200,imageHeight=t/e*imageWidth):b>I?(imageHeight=I-200,imageWidth=e/t*imageHeight):fitting=!0,b=imageHeight,k=imageWidth;(k>j||b>I)&&l(k,b),d(imageWidth,imageHeight)}return{width:Math.floor(imageWidth),height:Math.floor(imageHeight),containerHeight:Math.floor(b),containerWidth:Math.floor(k)+2*settings.horizontal_padding,contentHeight:Math.floor(y),contentWidth:Math.floor(w),resized:resized}}function d(t,i){t=parseFloat(t),i=parseFloat(i),$pp_details=$pp_pic_holder.find(".pp_details"),$pp_details.width(t),detailsHeight=parseFloat($pp_details.css("marginTop"))+parseFloat($pp_details.css("marginBottom")),$pp_details=$pp_details.clone().addClass(settings.theme).width(t).appendTo(e("body")).css({position:"absolute",top:-1e4}),detailsHeight+=$pp_details.height(),detailsHeight=detailsHeight<=34?36:detailsHeight,$pp_details.remove(),$pp_title=$pp_pic_holder.find(".ppt"),$pp_title.width(t),titleHeight=parseFloat($pp_title.css("marginTop"))+parseFloat($pp_title.css("marginBottom")),$pp_title=$pp_title.clone().appendTo(e("body")).css({position:"absolute",top:-1e4}),titleHeight+=$pp_title.height(),$pp_title.remove(),y=i+detailsHeight,w=t,b=y+titleHeight+$pp_pic_holder.find(".pp_top").height()+$pp_pic_holder.find(".pp_bottom").height(),k=t}function h(e){return e.match(/youtube\.com\/watch/i)||e.match(/youtu\.be/i)?"youtube":e.match(/vimeo\.com/i)?"vimeo":e.match(/\b.mov\b/i)?"quicktime":e.match(/\b.swf\b/i)?"flash":e.match(/\biframe=true\b/i)?"iframe":e.match(/\bajax=true\b/i)?"ajax":e.match(/\bcustom=true\b/i)?"custom":"#"==e.substr(0,1)?"inline":"image"}function c(){if(doresize&&"undefined"!=typeof $pp_pic_holder){if(scroll_pos=_(),contentHeight=$pp_pic_holder.height(),contentwidth=$pp_pic_holder.width(),projectedTop=I/2+scroll_pos.scrollTop-contentHeight/2,projectedTop<0&&(projectedTop=0),contentHeight>I)return;$pp_pic_holder.css({top:projectedTop,left:j/2+scroll_pos.scrollLeft-contentwidth/2})}}function _(){return self.pageYOffset?{scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset}:document.documentElement&&document.documentElement.scrollTop?{scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft}:document.body?{scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft}:void 0}function g(){I=e(window).height(),j=e(window).width(),"undefined"!=typeof $pp_overlay&&$pp_overlay.height(e(document).height()).width(j)}function m(){isSet&&settings.overlay_gallery&&"image"==h(pp_images[set_position])?(itemWidth=57,navWidth="facebook"==settings.theme||"pp_default"==settings.theme?50:30,itemsPerPage=Math.floor((f.containerWidth-100-navWidth)/itemWidth),itemsPerPage=itemsPerPage<pp_images.length?itemsPerPage:pp_images.length,totalPage=Math.ceil(pp_images.length/itemsPerPage)-1,0==totalPage?(navWidth=0,$pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").hide()):$pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").show(),galleryWidth=itemsPerPage*itemWidth,fullGalleryWidth=pp_images.length*itemWidth,$pp_gallery.css("margin-left",-(galleryWidth/2+navWidth/2)).find("div:first").width(galleryWidth+5).find("ul").width(fullGalleryWidth).find("li.selected").removeClass("selected"),goToPage=Math.floor(set_position/itemsPerPage)<totalPage?Math.floor(set_position/itemsPerPage):totalPage,e.prettyPhoto.changeGalleryPage(goToPage),$pp_gallery_li.filter(":eq("+set_position+")").addClass("selected")):$pp_pic_holder.find(".pp_content").unbind("mouseenter mouseleave")}function u(){if(settings.social_tools&&(facebook_like_link=settings.social_tools.replace("{location_href}",encodeURIComponent(location.href))),settings.markup=settings.markup.replace("{pp_social}",""),e("body").append(settings.markup),$pp_pic_holder=e(".pp_pic_holder"),$ppt=e(".ppt"),$pp_overlay=e("div.pp_overlay"),isSet&&settings.overlay_gallery){currentGalleryPage=0,toInject="";for(var t=0;t<pp_images.length;t++)pp_images[t].match(/\b(jpg|jpeg|png|gif)\b/gi)?(classname="",img_src=pp_images[t]):(classname="default",img_src=""),toInject+="<li class='"+classname+"'><a href='#'><img src='"+img_src+"' width='50' alt='' /></a></li>";toInject=settings.gallery_markup.replace(/{gallery}/g,toInject),$pp_pic_holder.find("#pp_full_res").after(toInject),$pp_gallery=e(".pp_pic_holder .pp_gallery"),$pp_gallery_li=$pp_gallery.find("li"),$pp_gallery.find(".pp_arrow_next").click(function(){return e.prettyPhoto.changeGalleryPage("next"),e.prettyPhoto.stopSlideshow(),!1}),$pp_gallery.find(".pp_arrow_previous").click(function(){return e.prettyPhoto.changeGalleryPage("previous"),e.prettyPhoto.stopSlideshow(),!1}),$pp_pic_holder.find(".pp_content").hover(function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeIn()},function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeOut()}),itemWidth=57,$pp_gallery_li.each(function(t){e(this).find("a").click(function(){return e.prettyPhoto.changePage(t),e.prettyPhoto.stopSlideshow(),!1})})}settings.slideshow&&($pp_pic_holder.find(".pp_nav").prepend('<a href="#" class="pp_play">Play</a>'),$pp_pic_holder.find(".pp_nav .pp_play").click(function(){return e.prettyPhoto.startSlideshow(),!1})),$pp_pic_holder.attr("class","pp_pic_holder "+settings.theme),$pp_overlay.css({opacity:0,height:e(document).height(),width:e(window).width()}).bind("click",function(){settings.modal||e.prettyPhoto.close()}),e("a.pp_close").bind("click",function(){return e.prettyPhoto.close(),!1}),settings.allow_expand&&e("a.pp_expand").bind("click",function(){return e(this).hasClass("pp_expand")?(e(this).removeClass("pp_expand").addClass("pp_contract"),doresize=!1):(e(this).removeClass("pp_contract").addClass("pp_expand"),doresize=!0),n(function(){e.prettyPhoto.open()}),!1}),$pp_pic_holder.find(".pp_previous, .pp_nav .pp_arrow_previous").bind("click",function(){return e.prettyPhoto.changePage("previous"),e.prettyPhoto.stopSlideshow(),!1}),$pp_pic_holder.find(".pp_next, .pp_nav .pp_arrow_next").bind("click",function(){return e.prettyPhoto.changePage("next"),e.prettyPhoto.stopSlideshow(),!1}),c()}a=jQuery.extend({hook:"rel",animation_speed:"fast",ajaxcallback:function(){},slideshow:5e3,autoplay_slideshow:!1,opacity:.8,show_title:!0,allow_resize:!0,allow_expand:!0,default_width:500,default_height:344,counter_separator_label:"/",theme:"pp_default",horizontal_padding:20,hideflash:!1,wmode:"opaque",autoplay:!0,modal:!1,deeplinking:!0,overlay_gallery:!0,overlay_gallery_max:30,keyboard_shortcuts:!0,changepicturecallback:function(){},callback:function(){},ie6_fallback:!0,markup:'<div class="pp_pic_holder"> 						<div class="ppt">&nbsp;</div> 						<div class="pp_top"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 						<div class="pp_content_container"> 							<div class="pp_left"> 							<div class="pp_right"> 								<div class="pp_content"> 									<div class="pp_loaderIcon"></div> 									<div class="pp_fade"> 										<a href="#" class="pp_expand" title="Expand the image">Expand</a> 										<div class="pp_hoverContainer"> 											<a class="pp_next" href="#">next</a> 											<a class="pp_previous" href="#">previous</a> 										</div> 										<div id="pp_full_res"></div> 										<div class="pp_details"> 											<div class="pp_nav"> 												<a href="#" class="pp_arrow_previous">Previous</a> 												<p class="currentTextHolder">0/0</p> 												<a href="#" class="pp_arrow_next">Next</a> 											</div> 											<p class="pp_description"></p> 											<div class="pp_social">{pp_social}</div> 											<a class="pp_close" href="#">Close</a> 										</div> 									</div> 								</div> 							</div> 							</div> 						</div> 						<div class="pp_bottom"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 					</div> 					<div class="pp_overlay"></div>',gallery_markup:'<div class="pp_gallery"> 								<a href="#" class="pp_arrow_previous">Previous</a> 								<div> 									<ul> 										{gallery} 									</ul> 								</div> 								<a href="#" class="pp_arrow_next">Next</a> 							</div>',image_markup:'<img id="fullResImage" src="{path}" />',flash_markup:'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',quicktime_markup:'<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',iframe_markup:'<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',inline_markup:'<div class="pp_inline">{content}</div>',custom_markup:"",social_tools:'<div class="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&layout=button_count&show_faces=true&width=500&action=like&font&colorscheme=light&height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>'},a);var f,v,y,w,b,k,P,x=this,$=!1,I=e(window).height(),j=e(window).width();return doresize=!0,scroll_pos=_(),e(window).unbind("resize.prettyphoto").bind("resize.prettyphoto",function(){c(),g()}),a.keyboard_shortcuts&&e(document).unbind("keydown.prettyphoto").bind("keydown.prettyphoto",function(t){if("undefined"!=typeof $pp_pic_holder&&$pp_pic_holder.is(":visible"))switch(t.keyCode){case 37:e.prettyPhoto.changePage("previous"),t.preventDefault();break;case 39:e.prettyPhoto.changePage("next"),t.preventDefault();break;case 27:settings.modal||e.prettyPhoto.close(),t.preventDefault()}}),e.prettyPhoto.initialize=function(){return settings=a,"pp_default"==settings.theme&&(settings.horizontal_padding=16),theRel=e(this).attr(settings.hook),galleryRegExp=/\[(?:.*)\]/,isSet=galleryRegExp.exec(theRel)?!0:!1,pp_images=isSet?jQuery.map(x,function(t){return-1!=e(t).attr(settings.hook).indexOf(theRel)?e(t).attr("href"):void 0}):e.makeArray(e(this).attr("href")),pp_titles=isSet?jQuery.map(x,function(t){return-1!=e(t).attr(settings.hook).indexOf(theRel)?e(t).find("img").attr("alt")?e(t).find("img").attr("alt"):"":void 0}):e.makeArray(e(this).find("img").attr("alt")),pp_descriptions=isSet?jQuery.map(x,function(t){return-1!=e(t).attr(settings.hook).indexOf(theRel)?e(t).attr("title")?e(t).attr("title"):"":void 0}):e.makeArray(e(this).attr("title")),pp_images.length>settings.overlay_gallery_max&&(settings.overlay_gallery=!1),set_position=jQuery.inArray(e(this).attr("href"),pp_images),rel_index=isSet?set_position:e("a["+settings.hook+"^='"+theRel+"']").index(e(this)),u(this),settings.allow_resize&&e(window).bind("scroll.prettyphoto",function(){c()}),e.prettyPhoto.open(),!1},e.prettyPhoto.open=function(t){return"undefined"==typeof settings&&(settings=a,pp_images=e.makeArray(arguments[0]),pp_titles=e.makeArray(arguments[1]?arguments[1]:""),pp_descriptions=e.makeArray(arguments[2]?arguments[2]:""),isSet=pp_images.length>1?!0:!1,set_position=arguments[3]?arguments[3]:0,u(t.target)),settings.hideflash&&e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility","hidden"),r(e(pp_images).size()),e(".pp_loaderIcon").show(),settings.deeplinking&&i(),settings.social_tools&&(facebook_like_link=settings.social_tools.replace("{location_href}",encodeURIComponent(location.href)),$pp_pic_holder.find(".pp_social").html(facebook_like_link)),$ppt.is(":hidden")&&$ppt.css("opacity",0).show(),$pp_overlay.show().fadeTo(settings.animation_speed,settings.opacity),$pp_pic_holder.find(".currentTextHolder").text(set_position+1+settings.counter_separator_label+e(pp_images).size()),"undefined"!=typeof pp_descriptions[set_position]&&""!=pp_descriptions[set_position]?$pp_pic_holder.find(".pp_description").show().html(unescape(pp_descriptions[set_position])):$pp_pic_holder.find(".pp_description").hide(),movie_width=parseFloat(o("width",pp_images[set_position]))?o("width",pp_images[set_position]):settings.default_width.toString(),movie_height=parseFloat(o("height",pp_images[set_position]))?o("height",pp_images[set_position]):settings.default_height.toString(),$=!1,-1!=movie_height.indexOf("%")&&(movie_height=parseFloat(e(window).height()*parseFloat(movie_height)/100-150),$=!0),-1!=movie_width.indexOf("%")&&(movie_width=parseFloat(e(window).width()*parseFloat(movie_width)/100-150),$=!0),$pp_pic_holder.fadeIn(function(){switch($ppt.html(settings.show_title&&""!=pp_titles[set_position]&&"undefined"!=typeof pp_titles[set_position]?unescape(pp_titles[set_position]):"&nbsp;"),imgPreloader="",skipInjection=!1,h(pp_images[set_position])){case"image":imgPreloader=new Image,nextImage=new Image,isSet&&set_position<e(pp_images).size()-1&&(nextImage.src=pp_images[set_position+1]),prevImage=new Image,isSet&&pp_images[set_position-1]&&(prevImage.src=pp_images[set_position-1]),$pp_pic_holder.find("#pp_full_res")[0].innerHTML=settings.image_markup.replace(/{path}/g,pp_images[set_position]),imgPreloader.onload=function(){f=l(imgPreloader.width,imgPreloader.height),s()},imgPreloader.onerror=function(){alert("Image cannot be loaded. Make sure the path is correct and image exist."),e.prettyPhoto.close()},imgPreloader.src=pp_images[set_position];break;case"youtube":f=l(movie_width,movie_height),movie_id=o("v",pp_images[set_position]),""==movie_id&&(movie_id=pp_images[set_position].split("youtu.be/"),movie_id=movie_id[1],movie_id.indexOf("?")>0&&(movie_id=movie_id.substr(0,movie_id.indexOf("?"))),movie_id.indexOf("&")>0&&(movie_id=movie_id.substr(0,movie_id.indexOf("&")))),movie="http://www.youtube.com/embed/"+movie_id,movie+=o("rel",pp_images[set_position])?"?rel="+o("rel",pp_images[set_position]):"?rel=1",settings.autoplay&&(movie+="&autoplay=1"),toInject=settings.iframe_markup.replace(/{width}/g,f.width).replace(/{height}/g,f.height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);break;case"vimeo":f=l(movie_width,movie_height),movie_id=pp_images[set_position];var t=/http(s?):\/\/(www\.)?vimeo.com\/(\d+)/,i=movie_id.match(t);movie="http://player.vimeo.com/video/"+i[3]+"?title=0&byline=0&portrait=0",settings.autoplay&&(movie+="&autoplay=1;"),vimeo_width=f.width+"/embed/?moog_width="+f.width,toInject=settings.iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,f.height).replace(/{path}/g,movie);break;case"quicktime":f=l(movie_width,movie_height),f.height+=15,f.contentHeight+=15,f.containerHeight+=15,toInject=settings.quicktime_markup.replace(/{width}/g,f.width).replace(/{height}/g,f.height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,pp_images[set_position]).replace(/{autoplay}/g,settings.autoplay);break;case"flash":f=l(movie_width,movie_height),flash_vars=pp_images[set_position],flash_vars=flash_vars.substring(pp_images[set_position].indexOf("flashvars")+10,pp_images[set_position].length),filename=pp_images[set_position],filename=filename.substring(0,filename.indexOf("?")),toInject=settings.flash_markup.replace(/{width}/g,f.width).replace(/{height}/g,f.height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+"?"+flash_vars);break;case"iframe":f=l(movie_width,movie_height),frame_url=pp_images[set_position],frame_url=frame_url.substr(0,frame_url.indexOf("iframe")-1),toInject=settings.iframe_markup.replace(/{width}/g,f.width).replace(/{height}/g,f.height).replace(/{path}/g,frame_url);break;case"ajax":doresize=!1,f=l(movie_width,movie_height),doresize=!0,skipInjection=!0,e.get(pp_images[set_position],function(e){toInject=settings.inline_markup.replace(/{content}/g,e),$pp_pic_holder.find("#pp_full_res")[0].innerHTML=toInject,s()});break;case"custom":f=l(movie_width,movie_height),toInject=settings.custom_markup;break;case"inline":myClone=e(pp_images[set_position]).clone().append('<br clear="all" />').css({width:settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo(e("body")).show(),doresize=!1,f=l(e(myClone).width(),e(myClone).height()),doresize=!0,e(myClone).remove(),toInject=settings.inline_markup.replace(/{content}/g,e(pp_images[set_position]).html())}imgPreloader||skipInjection||($pp_pic_holder.find("#pp_full_res")[0].innerHTML=toInject,s())}),!1},e.prettyPhoto.changePage=function(t){currentGalleryPage=0,"previous"==t?(set_position--,set_position<0&&(set_position=e(pp_images).size()-1)):"next"==t?(set_position++,set_position>e(pp_images).size()-1&&(set_position=0)):set_position=t,rel_index=set_position,doresize||(doresize=!0),settings.allow_expand&&e(".pp_contract").removeClass("pp_contract").addClass("pp_expand"),n(function(){e.prettyPhoto.open()})},e.prettyPhoto.changeGalleryPage=function(e){"next"==e?(currentGalleryPage++,currentGalleryPage>totalPage&&(currentGalleryPage=0)):"previous"==e?(currentGalleryPage--,currentGalleryPage<0&&(currentGalleryPage=totalPage)):currentGalleryPage=e,slide_speed="next"==e||"previous"==e?settings.animation_speed:0,slide_to=currentGalleryPage*itemsPerPage*itemWidth,$pp_gallery.find("ul").animate({left:-slide_to},slide_speed)},e.prettyPhoto.startSlideshow=function(){"undefined"==typeof P?($pp_pic_holder.find(".pp_play").unbind("click").removeClass("pp_play").addClass("pp_pause").click(function(){return e.prettyPhoto.stopSlideshow(),!1}),P=setInterval(e.prettyPhoto.startSlideshow,settings.slideshow)):e.prettyPhoto.changePage("next")},e.prettyPhoto.stopSlideshow=function(){$pp_pic_holder.find(".pp_pause").unbind("click").removeClass("pp_pause").addClass("pp_play").click(function(){return e.prettyPhoto.startSlideshow(),!1}),clearInterval(P),P=void 0},e.prettyPhoto.close=function(){$pp_overlay.is(":animated")||(e.prettyPhoto.stopSlideshow(),$pp_pic_holder.stop().find("object,embed").css("visibility","hidden"),e("div.pp_pic_holder,div.ppt,.pp_fade").fadeOut(settings.animation_speed,function(){e(this).remove()}),$pp_overlay.fadeOut(settings.animation_speed,function(){settings.hideflash&&e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility","visible"),e(this).remove(),e(window).unbind("scroll.prettyphoto"),p(),settings.callback(),doresize=!0,v=!1,delete settings}))},!pp_alreadyInitialized&&t()&&(pp_alreadyInitialized=!0,hashIndex=t(),hashRel=hashIndex,hashIndex=hashIndex.substring(hashIndex.indexOf("/")+1,hashIndex.length-1),hashRel=hashRel.substring(0,hashRel.indexOf("/")),setTimeout(function(){e("a["+a.hook+"^='"+hashRel+"']:eq("+hashIndex+")").trigger("click")},50)),this.unbind("click.prettyphoto").bind("click.prettyphoto",e.prettyPhoto.initialize)}}(jQuery);var pp_alreadyInitialized=!1;
;window.Modernizr=function(a,b,c){function x(a){j.cssText=a}function y(a,b){return x(prefixes.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b){for(var d in a)if(j[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}function D(a,b,c){var d=a.charAt(0).toUpperCase()+a.substr(1),e=(a+" "+n.join(d+" ")+d).split(" ");return z(b,"string")||z(b,"undefined")?B(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),C(e,b,c))}var d="2.5.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e}),p.cssanimations=function(){return D("animationName")},p.csstransitions=function(){return D("transition")};for(var E in p)w(p,E)&&(u=E.toLowerCase(),e[u]=p[E](),s.push((e[u]?"":"no-")+u));return x(""),i=k=null,function(a,b){function g(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function h(){var a=k.elements;return typeof a=="string"?a.split(" "):a}function i(a){var b={},c=a.createElement,e=a.createDocumentFragment,f=e();a.createElement=function(a){var e=(b[a]||(b[a]=c(a))).cloneNode();return k.shivMethods&&e.canHaveChildren&&!d.test(a)?f.appendChild(e):e},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+h().join().replace(/\w+/g,function(a){return b[a]=c(a),f.createElement(a),'c("'+a+'")'})+");return n}")(k,f)}function j(a){var b;return a.documentShived?a:(k.shivCSS&&!e&&(b=!!g(a,"article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio{display:none}canvas,video{display:inline-block;*display:inline;*zoom:1}[hidden]{display:none}audio[controls]{display:inline-block;*display:inline;*zoom:1}mark{background:#FF0;color:#000}")),f||(b=!i(a)),b&&(a.documentShived=b),a)}var c=a.html5||{},d=/^<|^(?:button|form|map|select|textarea)$/i,e,f;(function(){var a=b.createElement("a");a.innerHTML="<xyz></xyz>",e="hidden"in a,f=a.childNodes.length==1||function(){try{b.createElement("a")}catch(a){return!0}var c=b.createDocumentFragment();return typeof c.cloneNode=="undefined"||typeof c.createDocumentFragment=="undefined"||typeof c.createElement=="undefined"}()})();var k={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:j};a.html5=k,j(b)}(this,b),e._version=d,e._domPrefixes=o,e._cssomPrefixes=n,e.testProp=function(a){return B([a])},e.testAllProps=D,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+s.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return o.call(a)=="[object Function]"}function e(a){return typeof a=="string"}function f(){}function g(a){return!a||a=="loaded"||a=="complete"||a=="uninitialized"}function h(){var a=p.shift();q=1,a?a.t?m(function(){(a.t=="c"?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){a!="img"&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l={},o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};y[c]===1&&(r=1,y[c]=[],l=b.createElement(a)),a=="object"?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),a!="img"&&(r||y[c]===2?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i(b=="c"?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),p.length==1&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&o.call(a.opera)=="[object Opera]",l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return o.call(a)=="[object Array]"},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,i){var j=b(a),l=j.autoCallback;j.url.split(".").pop().split("?").shift(),j.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]||h),j.instead?j.instead(a,e,f,g,i):(y[j.url]?j.noexec=!0:y[j.url]=1,f.load(j.url,j.forceCSS||!j.forceJS&&"css"==j.url.split(".").pop().split("?").shift()?"c":c,j.noexec,j.attrs,j.timeout),(d(e)||d(l))&&f.load(function(){k(),e&&e(j.origUrl,i,g),l&&l(j.origUrl,i,g),y[j.url]=2})))}function i(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var j,l,m=this.yepnope.loader;if(e(a))g(a,0,m,0);else if(w(a))for(j=0;j<a.length;j++)l=a[j],e(l)?g(l,0,m,0):w(l)?B(l):Object(l)===l&&i(l,m);else Object(a)===a&&i(a,m)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,b.readyState==null&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};

jQuery(document).ready(function($) {

    var nx;
    /* ================= PORTOFOLIO PLUGIN ================= */
    (function( $ ){
        $.fn.categorized = function( settings, options ) {
            for(var i=0;i<options.length;i++){
                options[i] = $.extend({
                    resolution: 0,   //mandatory
                    columns: 0,   //mandatory
                    itemMarginRight: 0,
                    itemMarginBottom: 0,
                    containerPaddingTop: 0,
                    containerPaddingBottom: 0,
                    containerPaddingLeft: 0,
                    containerPaddingRight: 0,
                    itemHeight: 0   //mandatory
                }, options[i]);
                if(options[i].containerWidth===undefined)
                    options[i].containerWidth = options[i].resolution;
            }
            settings = $.extend({
                itemClass: '',   //mandatory
                time: 0,   //mandatory
                allCategory: '',   //mandatory
                categoryAttribute: 'data-categories'
            }, settings);
            var t = this.get(0);
            var t_container = $(t);
            var t_items = t_container.children('.'+settings.itemClass);
            var t_items_length = t_items.length;
            var t_items_categorized = [];
            var t_category_all = settings.allCategory;
            var t_category;
            if(settings.initialCategory!==undefined)
                t_category = settings.initialCategory;
            else
                t_category = t_category_all;
            var t_category_previous = t_category_all;
            var t_index = -1;
            var x_categorize = function(){
                for(var i=0;i<t_items_length;i++){
                    var x_current = t_items.filter(':eq('+i+')');
                    t_items_categorized.push({
                        item: x_current,
                        categories: x_current.attr(settings.categoryAttribute).replace(/^\s+/,'').replace(/\s+$/,'').replace(/\s+/g,' ').toLowerCase().split(' ')
                    });
                }

                nx=t_items_categorized;
            };
            x_categorize();
            var x_sortResolutions = function(){
                for(var i=0;i<options.length-1;i++){
                    var i_max = i;
                    for(var j=i+1;j<options.length;j++)
                        if(options[j].resolution>options[i_max].resolution){
                            i_max = j;
                        }
                    if(i_max>i){
                        var temp = options[i];
                        options[i] = options[i_max];
                        options[i_max] = temp;
                    }
                }
            };
            x_sortResolutions();
            var x_arrangeItems = function(){
                t_container.width(options[t_index].containerWidth);
                var x_width = Math.floor((options[t_index].containerWidth-options[t_index].containerPaddingLeft-options[t_index].containerPaddingRight-(options[t_index].columns-1)*options[t_index].itemMarginRight)/options[t_index].columns);
                var x_height = t_items.height();
                x_height = options[t_index].itemHeight;
                var x_index = 0;
                for(var i=0;i<t_items_length;i++){
                    if(-1!==t_items_categorized[i].categories.indexOf(t_category)||t_category===t_category_all){
                        if(-1!==t_items_categorized[i].categories.indexOf(t_category_previous)||t_category_previous===t_category_all){
                            t_items_categorized[i].item.stop().css({
                                overflow:'visible'
                            }).animate({
                                top: options[t_index].containerPaddingTop+Math.floor(x_index/options[t_index].columns)*(x_height+options[t_index].itemMarginBottom),
                                left: options[t_index].containerPaddingLeft+(x_index%options[t_index].columns)*(x_width+options[t_index].itemMarginRight)
                            },{
                                duration:settings.time,
                                queue:false,
                                easing:'linear'
                            });
                        }else{
                            t_items_categorized[i].item.stop().css({
                                overflow:'visible'
                            }).css({
                                top: options[t_index].containerPaddingTop+Math.floor(x_index/options[t_index].columns)*(x_height+options[t_index].itemMarginBottom),
                                left: options[t_index].containerPaddingLeft+(x_index%options[t_index].columns)*(x_width+options[t_index].itemMarginRight),
                                marginLeft: (1===options[t_index].columns?0:x_width/2),
                                marginTop: x_height/2
                            });
                        }
                        t_items_categorized[i].item.animate({
                            opacity: 1,
                            width: x_width,
                            height: x_height,
                            marginLeft: 0,
                            marginTop: 0
                        },{
                            duration:settings.time,
                            queue:false,
                            easing:'linear'
                        });
                        x_index++;
                    }else{
                        if(-1!==t_items_categorized[i].categories.indexOf(t_category_previous)||t_category_previous===t_category_all){
                            t_items_categorized[i].item.stop().css({
                                overflow:'hidden'
                            }).animate({
                                opacity: 0,
                                width: (1===options[t_index].columns?x_width:0),
                                height: 0,
                                marginLeft: (1===options[t_index].columns?0:x_width/2),
                                marginTop: x_height/2
                            },{
                                duration:settings.time,
                                queue:false,
                                easing:'linear'
                            });
                        }
                    }
                }
                t_container.stop().css({
                    overflow:'visible'
                }).animate({
                    height:options[t_index].containerPaddingTop+options[t_index].containerPaddingBottom+(x_index?(Math.ceil(x_index/options[t_index].columns)-1)*(x_height+options[t_index].itemMarginBottom)+x_height:0)
                },{
                    duration:settings.time,
                    queue:false,
                    easing:'linear'
                });
            };
            var x_arrangeItemsResponsive = function(){
                t_container.width(options[t_index].containerWidth);
                var x_width = Math.floor((options[t_index].containerWidth-options[t_index].containerPaddingLeft-options[t_index].containerPaddingRight-(options[t_index].columns-1)*options[t_index].itemMarginRight)/options[t_index].columns);
                var x_height = options[t_index].itemHeight;
                var x_index = 0;
                for(var i=0;i<t_items_length;i++){
                    if(!(-1===t_items_categorized[i].categories.indexOf(t_category))||t_category===t_category_all){
                        t_items_categorized[i].item.stop().css({
                            overflow:'visible'
                        }).css({
                            top: options[t_index].containerPaddingTop+Math.floor(x_index/options[t_index].columns)*(x_height+options[t_index].itemMarginBottom),
                            left: options[t_index].containerPaddingLeft+(x_index%options[t_index].columns)*(x_width+options[t_index].itemMarginRight),
                            opacity: 1,
                            width: x_width,
                            height: x_height,
                            marginLeft: 0,
                            marginTop: 0
                        });
                        x_index++;
                    }else
                        t_items_categorized[i].item.stop().css({
                            overflow:'hidden'
                        }).css({
                            top: options[t_index].containerPaddingTop+Math.floor(i/options[t_index].columns)*(x_height+options[t_index].itemMarginBottom),
                            left: options[t_index].containerPaddingLeft+(i%options[t_index].columns)*(x_width+options[t_index].itemMarginRight),
                            opacity: 0,
                            width: 0,
                            height: 0,
                            marginLeft: x_width/2,
                            marginTop: x_height/2
                        });
                }
                t_container.stop().css({
                    overflow:'visible'
                }).css({
                    height:options[t_index].containerPaddingTop+options[t_index].containerPaddingBottom+(x_index?(Math.ceil(x_index/options[t_index].columns)-1)*(x_height+options[t_index].itemMarginBottom)+x_height:0)
                });
            };
            t.changeCategory = function(category){
                if(category!==t_category){
                    t_category_previous = t_category;
                    t_category = category;
                    x_arrangeItems();
                }
            };
            var t_window = $(window);
            var x_resize = function(){
                var w_width = t_window.width();
                var t_index_temp = 0;
                while(w_width<options[t_index_temp].resolution&&t_index_temp<options.length-1)
                    t_index_temp++;
                if(t_index_temp!==t_index){
                    t_index = t_index_temp;
                    x_arrangeItemsResponsive();
                }
            };
            t_window.resize(x_resize);
            x_resize();
            t.destroyCategorizedObject = function(){
                t_window.unbind('resize',x_resize);
                delete t.changeCategory;
            };
            return t;
        };
    })( jQuery );



    /* ================= LOAD MODULES ================= */
    var t_browser_has_css3;
    var t_css3_array = ['transition','-webkit-transition','-moz-transition','-o-transition','-ms-transition'];
    var t_css3_index;
    $(document).ready(function(){
        var t_css3_test = $('body');
        for(t_css3_index=0, t_css3_test.css(t_css3_array[t_css3_index],'');t_css3_index<t_css3_array.length&&null===t_css3_test.css(t_css3_array[t_css3_index]);t_css3_test.css(t_css3_array[++t_css3_index],''));
        if(t_css3_index<t_css3_array.length)
            t_browser_has_css3 = true;
        else
            t_browser_has_css3 = false;
        load_photostream();
        load_main_slider();
        load_tooltips();
        load_carousel();
        load_contact();
        load_portofolio();
    });



    /* ================= SCROOL TOP ================= */
    $(document).ready(function () {
        $('.backtotop').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 1200, 'swing');
            return false;
        });
    });



    /* ================= PORTFOLIO HOVER EFFECTS ================= */
    $(function(){
        var t_time = 300;
        $(".hover_effect").hover(function(){
            //$(this).stop().animate({opacity:1},{queue:false,duration:t_time,easing:'linear'});
            $(this).find(".image_zoom img").stop().animate({
                marginTop:40
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
            //$(this).find(".porto_title").stop().animate({marginLeft:'0%'},{queue:false,duration:t_time,easing:'linear'});
            //$(this).find(".porto_type").stop().animate({marginLeft:'0%'},{queue:false,duration:t_time,easing:'linear'});
        },function(){
            //$(this).stop().animate({opacity:0},{queue:false,duration:t_time,easing:'linear'});
            $(this).find(".image_zoom img").stop().animate({
                marginTop:-90
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
            //$(this).find(".porto_title").stop().animate({marginLeft:'-100%'},{queue:false,duration:t_time,easing:'linear'});
            //$(this).find(".porto_type").stop().animate({marginLeft:'100%'},{queue:false,duration:t_time,easing:'linear'});
        });
    });



    /* ================= SLIDE CONTENT EFFECTS ================= */
    $(function(){
        var t_time = 300;
        $(".slide_image_hover").hover(function(){
            $(this).stop().animate({
                opacity:1
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
            $(this).find(".slide_image_zoom").stop().animate({
                left:48
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
            $(this).find(".slide_image_link").stop().animate({
                right:48
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
        },function(){
            $(this).stop().animate({
                opacity:0
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
            $(this).find(".slide_image_zoom").stop().animate({
                left:'-100%'
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
            $(this).find(".slide_image_link").stop().animate({
                right:'-100%'
            },{
                queue:false,
                duration:t_time,
                easing:'linear'
            });
        });
    });



    /* ================= KEYBORD ================= */
    $(document).ready(function () {
        $(".keybord_mini img").click(function(){
            $(".keybord").css("display","block");
        });
        $(".keybord").click(function(){
            $(".keybord").css("display","none");
        });
    });



    /* ================= TOOL TIP ================= */
    $(document).ready(function () {
        $('.tool_title').tooltip();
    });



    /* ================= PRETTY PHOTO ================= */
    $(document).ready(function(){
        $("a[data-rel^='prettyPhoto']").prettyPhoto();
    });


    /* ================= PHOTOSTREAM ================= */
    var load_photostream = function(){
        $('.Photostream').each(function(){
            var stream = $(this);
            var stream_userid = stream.attr('data-userid');
            var stream_items = parseInt(stream.attr('data-items'),10);
            $.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=json&id="+stream_userid+"&jsoncallback=?", function(stream_feed){
                for(var i=0;i<stream_items&&i<stream_feed.items.length;i++){
                    var stream_function = function(){
                        if(stream_feed.items[i].media.m){
                            var stream_a = $('<a>').addClass('PhotostreamLink').attr('href',stream_feed.items[i].link).attr('target','_blank');
                            var stream_img = $('<img>').addClass('PhotostreamImage').attr('src',stream_feed.items[i].media.m).attr('alt','').each(function(){
                                var t_this = this;
                                var j_this = $(this);
                                var t_loaded_function = function(){
                                    stream_a.append(t_this);
                                    if(j_this.width()<j_this.height())
                                        j_this.attr('style','width: 100% !important; height: auto !important;');
                                    else
                                        j_this.attr('style','width: auto !important; height: 100% !important;');
                                };
                                var t_loaded_ready = false;
                                var t_loaded_check = function(){
                                    if(!t_loaded_ready){
                                        t_loaded_ready = true;
                                        t_loaded_function();
                                    }
                                };
                                var t_loaded_status = function(){
                                    if(t_this.complete&&j_this.height()!==0)
                                        t_loaded_check();
                                };
                                t_loaded_status();
                                $(this).load(function(){
                                    t_loaded_check();
                                });
                                if($.browser.msie)
                                    this.src = this.src;
                            });
                            stream.append(stream_a);
                        }
                    };
                    stream_function();
                }
            });
        });
    };



    /* ================= IE fix ================= */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
    }



    /* ================= COLLAPSE ================= */
    $(function(){
        var t_accordion = $('#accordion');
        var t_active_class = 'accordion-heading-active';
        t_accordion.find('.collapse.in').parents('.accordion-group').find('.accordion-heading').addClass(t_active_class);
        t_accordion.find('.accordion-group').on('show', function () {
            $(this).find('.accordion-heading').addClass(t_active_class);
        });
        t_accordion.find('.accordion-group').on('hide', function () {
            $(this).find('.accordion-heading').removeClass(t_active_class);
        });
    });



    /* ================= MAIN SLIDER ================= */
    var load_main_slider = function(){
        $('.rs_mainslider').each(function(){
            var t_time = 1000;   //time for transition animation
            var t_interval_time = 4000;   //time for slide change, must be equal or bigger then effect transition time;
            var t_resume_time = 10000;   //time to resume autoplay after a click
            var t_hover_time = 200;   //time for hover eefect
            var t_text_time = 500;   //time for text animation
            var t = $(this);
            var t_prev = t.find('.rs_mainslider_left');
            var t_next = t.find('.rs_mainslider_right');
            var t_items_container = t.find('ul.rs_mainslider_items');
            var t_items = t_items_container.find('li');
            var t_dots_container = t.find('.rs_mainslider_dots_container ul.rs_mainslider_dots');
            var t_dots;
            var t_items_active_class = 'rs_mainslider_items_active';
            var t_items_active_selector = '.'+t_items_active_class;
            var t_dots_active_class = 'rs_mainslider_dots_active';
            var t_dots_active_selector = '.'+t_dots_active_class;
            var t_index = 0;
            var t_index_max = t_items.length-1;
            var t_select_fix = function(){
                return false;
            };
            var t_interval = 0;
            var t_timeout = 0;
            var t_autoplay_start = function(){
                t_interval = setInterval(t_next_function,t_interval_time);
            };
            var t_autoplay_stop = function(){
                clearInterval(t_interval);
                clearTimeout(t_timeout);
                t_timeout = setTimeout(t_autoplay_start,t_resume_time);
            };
            var t_text = t.find('ul.rs_mainslider_items li .rs_mainslider_items_text');
            var t_text_top = t_text.css('top');
            var t_text_last;
            var t_next_function = function(){
                var t_text_old = t_text.filter(':eq('+t_index+')');
                t_index++;
                if(t_index>t_index_max)
                    t_index = 0;
                var t_text_current = t_text.filter(':eq('+t_index+')');
                if(t_text_last!==undefined)
                    t_text_last.stop(true).css({
                        top:-t_text_last.height()
                    });
                t_text_last = t_text_old;
                t_text_old.stop(true).animate({
                    top:'100%'
                },{
                    queue:false,
                    duration:t_text_time,
                    easing:'easeInBack',
                    complete:function(){
                        t_text_current.stop(true).animate({
                            top:t_text_top
                        },{
                            queue:false,
                            duration:t_text_time,
                            times:1,
                            easing:'easeOutBack'
                        });
                    }
                });
                t_items_container.css({
                    height:t_items.filter(t_items_active_selector).outerHeight(true)
                });
                t_items.filter(t_items_active_selector).removeClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({
                    opacity:0
                },{
                    queue:false,
                    duration:t_time,
                    easing:'swing'
                });
                t_dots.filter(t_dots_active_selector).removeClass(t_dots_active_class);
                t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({
                    opacity:1
                },{
                    queue:false,
                    duration:t_time,
                    easing:'swing'
                });
                t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
                t_items_container.css({
                    height:'auto'
                });
            };
            var t_items_count = t_items.length;
            t_text.each(function(i){
                $(this).css({
                    top:'-100%'
                });
            });
            t_items.each(function(){
                var x = $(this);
                var x_img = x.children('.rs_mainslider_items_image');
                var x_text = x.children('.rs_mainslider_items_text');
                x_img.each(function(){
                    var t_this = this;
                    var t_loaded_function = function(){
                        x_text.css({
                            top:-$(t_this).height()
                        });
                        t_items_count--;
                        if(t_items_count===0){
                            t_text.filter(':eq('+t_index+')').stop(true).animate({
                                top:t_text_top
                            },{
                                queue:false,
                                duration:t_text_time,
                                easing:'easeOutBack'
                            });
                            for(i=0;i<=t_index_max;i++)
                                t_dots_container.append('<li'+(t_index===i?' class="'+t_dots_active_class+'"':'')+'></li>');
                            t_dots = t_dots_container.children('li');
                            t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({
                                opacity:1
                            },{
                                queue:false,
                                duration:t_time,
                                easing:'swing'
                            });
                            t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
                            t_prev.click(function(){
                                var t_text_old = t_text.filter(':eq('+t_index+')');
                                t_index--;
                                if(t_index<0)
                                    t_index = t_index_max;
                                var t_text_current = t_text.filter(':eq('+t_index+')');
                                if(t_text_last!==undefined)
                                    t_text_last.stop(true).css({
                                        top:-t_text_last.height()
                                    });
                                t_text_last = t_text_old;
                                t_text_old.stop(true).css({
                                    top:t_text_top
                                }).animate({
                                    top:'100%'
                                },{
                                    queue:false,
                                    duration:t_text_time,
                                    easing:'easeInBack',
                                    complete:function(){
                                        t_text_current.stop(true).animate({
                                            top:t_text_top
                                        },{
                                            queue:false,
                                            duration:t_text_time,
                                            times:1,
                                            easing:'easeOutBack'
                                        });
                                    }
                                });
                                t_items_container.css({
                                    height:t_items.filter(t_items_active_selector).outerHeight(true)
                                });
                                t_items.filter(t_items_active_selector).removeClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({
                                    opacity:0
                                },{
                                    queue:false,
                                    duration:t_time,
                                    easing:'swing'
                                });
                                t_dots.filter(t_dots_active_selector).removeClass(t_dots_active_class);
                                t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({
                                    opacity:1
                                },{
                                    queue:false,
                                    duration:t_time,
                                    easing:'swing'
                                });
                                t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
                                t_items_container.css({
                                    height:'auto'
                                });
                                t_autoplay_stop();
                            });
                            t_next.click(function(){
                                t_next_function();
                                t_autoplay_stop();
                            });
                            t_dots.click(function(){
                                var t_dots_current = t_dots.filter(t_dots_active_selector).not(this);
                                if(t_dots_current.length){
                                    var t_text_old = t_text.filter(':eq('+t_index+')');
                                    t_index = t_dots.index(this);
                                    var t_text_current = t_text.filter(':eq('+t_index+')');
                                    if(t_text_last!==undefined)
                                        t_text_last.stop(true).css({
                                            top:-t_text_last.height()
                                        });
                                    t_text_last = t_text_old;
                                    t_text_old.stop(true).css({
                                        top:t_text_top
                                    }).animate({
                                        top:'100%'
                                    },{
                                        queue:false,
                                        duration:t_text_time,
                                        easing:'easeInBack',
                                        complete:function(){
                                            t_text_current.stop(true).animate({
                                                top:t_text_top
                                            },{
                                                queue:false,
                                                duration:t_text_time,
                                                times:1,
                                                easing:'easeOutBack'
                                            });
                                        }
                                    });
                                    t_items_container.css({
                                        height:t_items.filter(t_items_active_selector).outerHeight(true)
                                    });
                                    t_items.filter(t_items_active_selector).removeClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({
                                        opacity:0
                                    },{
                                        queue:false,
                                        duration:t_time,
                                        easing:'swing'
                                    });
                                    t_dots_current.filter(t_dots_active_selector).removeClass(t_dots_active_class);
                                    t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({
                                        opacity:1
                                    },{
                                        queue:false,
                                        duration:t_time,
                                        easing:'swing'
                                    });
                                    t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
                                    t_items_container.css({
                                        height:'auto'
                                    });
                                }
                                t_autoplay_stop();
                            });
                            t.hover(function(){
                                t_prev.stop(true).animate({
                                    opacity:1
                                },{
                                    queue:false,
                                    duration:t_hover_time,
                                    easing:'linear'
                                });
                                t_next.stop(true).animate({
                                    opacity:1
                                },{
                                    queue:false,
                                    duration:t_hover_time,
                                    easing:'linear'
                                });
                            },function(){
                                t_prev.stop(true).animate({
                                    opacity:0
                                },{
                                    queue:false,
                                    duration:t_hover_time,
                                    easing:'linear'
                                });
                                t_next.stop(true).animate({
                                    opacity:0
                                },{
                                    queue:false,
                                    duration:t_hover_time,
                                    easing:'linear'
                                });
                            });
                            t_prev.mousedown(t_select_fix);
                            t_next.mousedown(t_select_fix);
                            t_dots.mousedown(t_select_fix);
                            t_autoplay_start();
                        }
                    };
                    var t_loaded_ready = false;
                    var t_loaded_check = function(){
                        if(!t_loaded_ready){
                            t_loaded_ready = true;
                            t_loaded_function();
                        }
                    };
                    var t_loaded_status = function(){
                        if(t_this.complete)
                            t_loaded_check();
                    };
                    $(this).load(function(){
                        t_loaded_check();
                    });
                    t_loaded_status();
                    if($.browser.msie)
                        this.src = this.src;
                });
            });
        });
    };



    /* ================= TOOLTIPS ================= */
    var load_tooltips = function(){
        var t_hints_close_time = 500;   //time for hint fade effect
        var t_scroll_time = 300;   //time for scrolling to hint
        var t_hints_expires_minutes = 5;   //minutes after which the cookie will expirev
        var t_hint_cookie = 'agat_tooltips';
        var t_hints = $('.hints');
        var t_hints_n = t_hints.length;
        if(t_hints_n){
            var t_index  = $.cookie(t_hint_cookie);
            if(null===t_index)
                t_index = '1';
            if('-1'!==t_index){
                var t_html = $.browser.msie?$('html'):$('html,body');
                var t_window = $(window);
                var t_document = $(document);
                t_hints.filter('[data-index='+t_index+']').css({
                    visibility:'visible'
                }).animate({
                    opacity:1
                },{
                    queue:false,
                    duration:t_hints_close_time,
                    easing:'swing'
                });
                t_hints.each(function(){
                    var t = $(this);
                    var t_next = t.find('.hint_next');
                    var t_close = t.find('.hint_close');
                    t_close.click(function(){
                        t.animate({
                            opacity:0
                        },{
                            queue:false,
                            duration:t_hints_close_time,
                            easing:'swing',
                            complete:function(){
                                t.css({
                                    visibility:'hidden'
                                });
                            }
                        });
                        var t_date = new Date();
                        t_date.setMinutes(t_date.getMinutes()+t_hints_expires_minutes);
                        $.cookie(t_hint_cookie,-1,{
                            expires: t_date
                        });
                        return false;
                    });
                    t_next.click(function(){
                        var t_date = new Date();
                        t_date.setMinutes(t_date.getMinutes()+t_hints_expires_minutes);
                        t.animate({
                            opacity:0
                        },{
                            queue:false,
                            duration:t_hints_close_time,
                            easing:'swing',
                            complete:function(){
                                t.css({
                                    visibility:'hidden'
                                });
                            }
                        });
                        t_index = t_hints.filter('[data-index='+t_index+']').attr('data-next');
                        if('-1'!==t_index){
                            $.cookie(t_hint_cookie,t_index,{
                                expires: t_date
                            });
                        }else{
                            $.cookie(t_hint_cookie,-1,{
                                expires: t_date
                            });
                        }
                        var t_href = t_next.attr('href');
                        if(null===t_href||'#'===t_href[0]||'#'===t_href){
                            if('-1'!==t_index){
                                var t_current = t_hints.filter('[data-index='+t_index+']');
                                var t_current_position = t_current.offset();
                                t_html.animate({
                                    scrollTop:Math.min(t_document.height()-t_window.height(),Math.max(0,t_current_position.top-t_window.height()/2))
                                },{
                                    queue:false,
                                    duration:t_scroll_time,
                                    easing:'swing'
                                });
                                t_current.css({
                                    visibility:'visible'
                                }).animate({
                                    opacity:1
                                },{
                                    queue:false,
                                    duration:t_hints_close_time,
                                    easing:'swing'
                                });
                            }
                            return false;
                        }else
                            return true;
                    });
                });
            }
        }
    };



    /* ================= CAROUSEL ================= */
    var load_carousel = function(){
        $('.slide_content').each(function(){
            var t_time = 500;   //time for animation effect
            var t = $(this);
            var t_scroll_width = $.browser.mozilla||$.browser.opera||$.browser.msie?scrollbarWidth():0;
            var t_prev = t.prev('.center_title').find('.slide_nav_back');
            var t_next = t.prev('.center_title').find('.slide_nav_next');
            var t_bar = t.prev('.slide_bar');
            var t_items = t.find('.slide_content_full>div').not('.clear');
            var t_items_container = t.find('.slide_content_full');
            var t_items_n = t_items.length;
            var t_items_container_visible_width;
            var t_items_width;
            var t_visible;
            var t_index = 0;
            var t_index_max;
            var t_prev_function;
            var t_next_function;
            var t_bar_moving = false;
            var t_bar_left = 0;
            var t_bar_left_max;
            var t_bar_items_width;
            var t_bar_items_ratio;
            var t_items_container_left_max;
            var t_pre_process_specific;
            var t_items_responsive_interval = 0;
            var t_pre_process = function(){
                clearInterval(t_items_responsive_interval);
                t_items_container.stop().css({
                    height:'auto'
                });
                t_items.stop().attr('style','overflow:hidden; padding:5px 0px;');
                t_items_container_visible_width = t.find('.slide_content_show').width();
                t_items_width = t_items.outerWidth(true);
                t_visible = Math.round(t_items_container_visible_width/t_items_width);
                t_index_max = t_items.length-Math.min(t_items.length,t_visible);
                t_index = t_index>t_index_max?0:t_index;

                t_pre_process_specific();
            };
            var t_img = t.find('img');
            var t_img_n = t_img.length;
            var t_img_loaded = function(){
                var t_w = $(window);
                var t_d = $(document);
                var t_bar_left_temp = t_bar_left;
                var t_bar_left_temp_new;
                var t_bar_moving_allow = true;
                var t_bar_moving_timeout = 0;
                var t_bar_moving_timeout_2 = 0;
                var t_bar_moving_x;
                var t_bar_time = 50;
                var t_bar_animate_time = 200;
                var t_items_responsive_time = 500;
                var t_items_responsive_interval_time = 2000;
                var t_items_responsive_function = function(){};
                t_prev.click(function(){
                    t_prev_function();
                });
                t_next.click(function(){
                    t_next_function();
                });
                t_bar.mousedown(function(e_down){
                    t_bar_moving = true;
                    t_bar.stop();
                    t_items_container.stop();
                    t_d.mousemove(function(e_move){

                        t_bar_moving_x = e_move.pageX;

                        if(t_bar_moving_allow){
                            t_bar_left_temp_new = Math.min(Math.max(0, t_bar_left+t_bar_moving_x-e_down.pageX),t_bar_left_max);
                            if(t_bar_left_temp!==t_bar_left_temp_new){
                                t_bar_moving_allow = false;
                                t_bar_left_temp = t_bar_left_temp_new;
                                t_bar.css({
                                    left:t_bar_left_temp
                                });
                                t_items_container.css({
                                    left:-t_bar_left_temp*t_bar_items_ratio
                                });
                                t_bar_moving_timeout = setTimeout(function(){
                                    t_bar_left_temp_new = Math.min(Math.max(0, t_bar_left+t_bar_moving_x-e_down.pageX),t_bar_left_max);
                                    if(t_bar_left_temp!==t_bar_left_temp_new){
                                        t_bar_left_temp = t_bar_left_temp_new;
                                        t_bar.css({
                                            left:t_bar_left_temp
                                        });
                                        t_items_container.css({
                                            left:-t_bar_left_temp*t_bar_items_ratio
                                        });
                                        t_bar_moving_timeout_2 = setTimeout(function(){
                                            t_bar_moving_allow = true;
                                        },t_bar_time);
                                    }else
                                        t_bar_moving_allow = true;
                                },t_bar_time);
                            }
                        }
                    });
                    t_d.mouseup(function(e_up){
                        t_bar_moving = false;
                        clearInterval(t_bar_moving_timeout);
                        clearInterval(t_bar_moving_timeout_2);
                        t_bar_moving_allow = true;
                        t_index = Math.round(t_bar_left_temp/t_bar_items_width);
                        t_bar_left = t_bar_items_width*t_index;
                        t_bar.animate({
                            left:t_bar_left
                        },{
                            queue:false,
                            duration:t_bar_animate_time,
                            easing:'linear'
                        });
                        t_items_container.animate({
                            left:-t_items_width*t_index
                        },{
                            queue:false,
                            duration:t_bar_animate_time,
                            easing:'linear'
                        });
                        t_d.unbind('mousemove').unbind('mouseup');
                    });
                    return false;
                });
                var t_w_x = -1;
                var t_w_width_get = function(){
                    var t_w_width = t_w.width();
                    var t_w_height = t_w.height();
                    var t_d_height = t_d.height();
                    if(t_w_height<t_d_height)
                        t_w_width += t_scroll_width;
                    return t_w_width;
                };
                var t_w_resize_function = function(){
                    var t_w_width = t_w_width_get();
                    if( t_w_width>=980){
                        if(t_w_x!==0){
                            t_w_x = 0;

                            t_pre_process_specific = function(){

                                t_bar_left_max = t.outerWidth(true)-t_bar.outerWidth(true);
                                t_items_container_left_max = t_index_max*t_items_width;
                                t_bar_items_width = t_items_width*t_bar_left_max/t_items_container_left_max;
                                t_bar_items_ratio = t_items_container_left_max/t_bar_left_max;

                                t_bar_left = t_bar_items_width*t_index;
                                t_bar.stop(true).css({
                                    left:t_bar_left
                                });
                                t_items_container.stop(true).css({
                                    left:-t_items_width*t_index
                                });
                            };
                            t_pre_process();
                        }
                    }else
                    if( t_w_width>=768){
                        if(t_w_x!==1){
                            t_w_x = 1;

                            t_pre_process_specific = function(){
                                t_bar_left_max = t.outerWidth(true)-t_bar.outerWidth(true);
                                t_items_container_left_max = t_index_max*t_items_width;
                                t_bar_items_width = t_items_width*t_bar_left_max/t_items_container_left_max;
                                t_bar_items_ratio = t_items_container_left_max/t_bar_left_max;

                                t_bar_left = t_bar_items_width*t_index;
                                t_bar.stop(true).css({
                                    left:t_bar_left
                                });
                                t_items_container.stop(true).css({
                                    left:-t_items_width*t_index
                                });
                            };
                            t_pre_process();

                        }
                    }else{
                        if( t_w_x!==2 ){
                            t_w_x = 2;
                            t_items_responsive_function = function(){
                                t_items.filter(':eq('+t_index+')').stop().animate({
                                    opacity:0
                                },{
                                    queue:false,
                                    duration:t_items_responsive_time,
                                    easing:'linear'
                                });
                                if(t_index<t_index_max)
                                    t_index++;
                                else
                                    t_index = 0;
                                t_items.filter(':eq('+t_index+')').stop().animate({
                                    opacity:1
                                },{
                                    queue:false,
                                    duration:t_items_responsive_time,
                                    easing:'linear'
                                });
                            };

                            t_pre_process_specific = function(){
                                t_visible = 1;
                                t_index_max = t_items_n-1;
                                t_index = 0;
                                if(t_index_max)
                                    t_items.filter(':gt('+String(t_visible-1)+')').css({
                                        opacity:0
                                    });
                                t_items_container.css({
                                    height:t_items.filter(':gt('+t_index+')').outerHeight(true)
                                });
                                t_items_responsive_interval = setInterval(function(){
                                    t_items_responsive_function();
                                },t_items_responsive_interval_time);
                            };
                            t_pre_process();

                        }
                    }
                };
                t_w.resize(t_w_resize_function);
                t_w_resize_function();
            };
            var t_img_ready = [];
            var t_img_ready_complete = false;
            var t_img_ready_all = function(){
                var i = 0;
                for(i=0;i<t_img_n&&(t_img_ready[i]===1||t_img[i].complete);i++);
                return i===t_img_n;
            };
            var t_img_ready_check = function(){
                var t_img_ready_complete_temp = t_img_ready_all();
                if(!t_img_ready_complete&&t_img_ready_complete_temp){
                    t_img_ready_complete = t_img_ready_complete_temp;
                    t_img_loaded();
                }
            };
            t_img.each(function(index){
                t_img_ready[index] = 0;
            });
            if($.browser.msie){
                t_img.each(function(){
                    this.src = this.src;
                });
            }
            t_img.load(function(index){
                t_img_ready[index] = 1;
                t_img_ready_check();
            });
            t_img_ready_check();
            t_prev.mousedown(function(){
                return false;
            });
            t_next.mousedown(function(){
                return false;
            });
        });
    };


    /* ================= CONTACTS FORM ================= */
    var load_contact = function(){
        $('#contact_page_form').each(function(){
            var t = $(this);
            var t_result = $('#contact_page_form_result');
            var validate_email = function validateEmail(email) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            };
            t.submit(function(event) {
                event.preventDefault();
                var t_values = {};
                var t_values_items = t.find('input[name],textarea[name]');
                t_values_items.each(function() {
                    t_values[this.name] = $(this).val();
                });
                if(t_values['name']===''||t_values['email']===''||t_values['message']===''){
                    t_result.html('Please fill in all the required fields.');
                }else
                if(!validate_email(t_values['email']))
                    t_result.html('Please provide a valid e-mail.');
                else
                    $.post(templateDir + "/php/contacts.php", t.serialize(),function(result){
                        t_result.html(result);
                    });
            });

        });
    };




    // ========================== PORTO-FILTERS ========================== //
    var load_portofolio = function(){
        $('.porto_filter').each(function(){
            var t = $(this);
            var t_filters = t.children('.porto_filterFilter').children('ul.porto_filterFilterCategories').children('li');
            var t_filters_active_class = 'porto_filter_active';
            var t_filters_active_selector = '.'+t_filters_active_class;
            var t_views = t.children('.porto_filterViews').children('.porto_filterViewsOption');
            var t_views_active_class = 'worksViewsOptionActive';
            var t_views_active_selector = '.'+t_views_active_class;
            var t_container = t.children('.porto_filterContainer');
            var t_categorized_object;
            var t_settings1 = {
                itemClass: 'porto_box',
                time: 400,
                allCategory: 'all'
            };
            var t_options1 = [
                {
                    resolution: 980,
                    columns: 4,
                    itemHeight: 260,
                    itemMarginRight: 20,
                    itemMarginBottom: 20,
                    containerWidth: 940
                },
                {
                    resolution: 768,
                    columns: 3,
                    itemHeight: 270,
                    itemMarginRight: 20,
                    itemMarginBottom: 20,
                    containerWidth: 724
                },
                {
                    resolution: 520,
                    columns: 2,
                    itemHeight: 270,
                    itemMarginRight: 20,
                    itemMarginBottom: 20,
                    containerWidth: 480
                },
                {
                    resolution: 300,
                    columns: 1,
                    itemHeight: 320,
                    itemMarginBottom: 20
                }
            ];
            var t_settings2 = {
                itemClass: 'porto_box',
                time: 400,
                allCategory: 'all'
            };
            var t_options2 = [
                {
                    resolution: 960,
                    columns: 1,
                    itemHeight: 215,
                    itemMarginBottom: 35
                },
                {
                    resolution: 768,
                    columns: 1,
                    itemHeight: 172,
                    itemMarginBottom: 35
                },
                {
                    resolution: 480,
                    columns: 1,
                    itemHeight: 107,
                    itemMarginBottom: 35
                },
                {
                    resolution: 300,
                    columns: 1,
                    itemHeight: 67,
                    itemMarginBottom: 35
                }
            ];
            var t_parameters = [[t_settings1,t_options1],[t_settings2,t_options2]];


            t_filters.click(function(){
                var t_filters_last = t_filters.filter(t_filters_active_selector).not(this);
                if(t_filters_last.length){
                    t_filters_last.removeClass(t_filters_active_class);
                    var t_filters_current = $(this);
                    t_filters_current.addClass(t_filters_active_class);
                    t_categorized_object.changeCategory(t_filters_current.attr('data-category'));
                }
            });
            t_views.click(function(){
                var t_views_last = t_views.filter(t_views_active_selector).not(this);
                if(t_views_last.length){
                    t_views_last.removeClass(t_views_active_class);
                    t_container.removeClass(t_views_last.attr('data-class'));
                    var t_views_current = $(this);
                    t_views_current.addClass(t_views_active_class);
                    t_container.addClass(t_views_current.attr('data-class'));
                    t_categorized_object.destroyCategorizedObject();
                    var x_index = t_views.index(this);
                    t_parameters[x_index][0].initialCategory = t_filters.filter(t_filters_active_selector).attr('data-category');
                    t_categorized_object = t_container.categorized(t_parameters[x_index][0],t_parameters[x_index][1]);
                }
            });
            t_categorized_object = t_container.categorized(t_parameters[0][0],t_parameters[0][1]);
        });
    };
    function scrollbarWidth() {
        var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
        // Append our div, do our calculation and then remove it
        $('body').append(div);
        var w1 = $('div', div).innerWidth();
        div.css('overflow-y', 'scroll');
        var w2 = $('div', div).innerWidth();
        $(div).remove();
        return (w1 - w2);
    }

    /* ================= PARALAX SLIDER ================= */

    $(function() {
        jQuery('#da-slider').cslider({autoplay  : true});
    });
});