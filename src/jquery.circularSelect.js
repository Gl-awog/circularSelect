/**
 * @author GL.awog
 * @version 1.0.0
 *
 * Circular select with colored circular options
 */

(function($) {
	
	'use strict';
	
	function CircularSelect(el, opts) {
		 this.$el = $(el);
		 this.opts = opts;
		 this.wrapperClass = "circular-wrap";
		 this.$wrapper = $("<div></div>").attr("class",this.wrapperClass);
		 this.choiceClass = "circular-choice";    				 
		 this.$choice = $("<button></button>").attr("class",this.choiceClass);
		 this.choiceSpanClass = "circular-txt";
		 this.$choiceSpan = $("<span></span>").attr("class",this.choiceSpanClass);
		 this.dropDownClass = "circular-dropdown";
		 this.$dropDown = $("<div></div>").attr("class",this.dropDownClass);
		 this.optListClass = "circular-optlist";
		 this.$optList = $("<ul></ul>").attr("class",this.optListClass);   				 
		 this.isOpen = false;				 
	}
	
	
	CircularSelect.prototype = {
					
		constructor : CircularSelect,
		
		_init : function() {
			var self = this;

			this.$descendants = this.$el.find("option,optgroup"); 
			var fragment = document.createDocumentFragment();
			var selTxt = "";
			var elName = this.$el.attr("name");
			
			this.$descendants.each(function(k,v){		
				
				var li = document.createElement("li");
					
				if (v.tagName.toLowerCase()=="option") {
					li.innerHTML = v.text; 
					li.setAttribute("val", v.value);
					li.setAttribute("id",elName+"_option_"+k);																
					 
					if (v.selected) {									
						li.className = "selected-li"; 
						selTxt = li.innerHTML;
					}
					
				} else if (v.tagName.toLowerCase()=="optgroup") {
					li.className="circular-optgroup";
					li.innerHTML = v.getAttribute("label");
				}
				fragment.appendChild(li);
			});
			
			
			this.$optList.append(fragment);
			this.$dropDown.append(this.$optList);					
			if (!this.$el.parent("."+this.wrapperClass).length) this.$el.wrap(this.$wrapper);
		
			if (!this.$wrapper.find("."+this.choiceClass).length) {
				if (this.opts.choiceBgColor!="auto") this.$choice.css({"background":this.opts.choiceBgColor});
				this.$choice.append(this.$choiceSpan);
				this.$el.after(this.$choice);
			}
			this.$choiceSpan.html(selTxt);
			this.$choice.after(this.$dropDown);	
			this.$li = this.$optList.children("li");
			this.liCnt = this.$li.length;
			this._adjustDimensions();
			this.$el.hide();			
			this.isAnimating = false;			
			if (!this.redrawing) {
				this._bindEvents();
			}	
		},
		
		_bindEvents : function() {
			var self = this; 
			
			this.$choice.on("click.circularSelect",function(){ 
				if(!self.isOpen) {
					if (!self.isAnimating) self.show();
				}	 
				else { self.hide(); }
			});
			
			this.$dropDown.on("click.circularSelect","li:not(.circular-optgroup)",function(event){ 
				var val = $(this).attr("val");			
				self.$el.val(val);
				self.refreshVal();
				self.hide();
			});
			
			$("body").on("click.circularSelect",function(event){ 
				var closestSelect = $(event.target).closest(".circular-wrap").find("select");
				
				//if click outside circular select or inside another decosel on the same page - hide the current one
				if ((!closestSelect.length || closestSelect.get(0) !== self.$el.get(0))) {
		
					if (self.isOpen) { 
						self.hide();
					} else if(self.isAnimating) { 
						
						self.dfd = $.Deferred();
						self.dfd.done(function(){
							self.hide();	
						});
					}								
				} 				
			}).on("change.circularSelect",this.$el,$.proxy(self.refreshVal, self));
			
			
		},
		
		refreshVal:function() { 
			var self = this;
			
			var selectedOption = this.$el.find(":selected"); 
			var selTxt = selectedOption.text();
			var selVal = selectedOption.val();						
			this.$choiceSpan.html(selTxt);
			this.$li.filter("[val='"+selVal+"']").addClass("selected-li").siblings().removeClass("selected-li");
		},
		
		_adjustDimensions :function() {
			var self = this;
			
			//setting width
			var naturalWidth = this.$el.get(0).offsetWidth-20; // 20px is a system select indent from the right. 
			var dropdownWidth = (this.opts.dropdownOptionWidth!="auto" && !isNaN(this.opts.dropdownOptionWidth)) ? this.opts.dropdownOptionWidth : naturalWidth;						
			var choiceWidth = (function(){
				var ww = 0;
				if (self.opts.choiceWidth =="auto" || isNaN(self.opts.choiceWidth)) {
					ww = dropdownWidth;
				} else  {
					ww = self.opts.choiceWidth;
				}
				
				return ww;
			}());
			
			this.diameter = dropdownWidth;
			this.$dropDown.css({"width":dropdownWidth+"px"});		
			this.$li.css({"width":dropdownWidth+"px","height":dropdownWidth+"px"});					
			this.$choice.css({"width":choiceWidth+"px","height":choiceWidth+"px"}); 
		},
	
		
		show : function() { 
			var self =this; 
			
			var adjuster = this.opts.adjuster;			
			var liH = this.$li.first().height()-adjuster;			
			var time = this.opts.showTime;
			var delay = 0;
			var easing = this.opts.showEasing ? this.opts.showEasing : "linear";
			var angle =  this.opts.diagonalDegree * Math.PI / 180; //conversion to radians
			
			this.prevTops= [0];
			this.prevLefts = [0];
			
			if (!this.isOpen) {
				
				this.$dropDown.show().css({"top":0 +"px"});
				this.$choice.addClass("clicked");				
				this._optionColorize();
				this.isAnimating = !0;
			
				this.$li.each(function(k,v){
					var $v = $(v);
					var hh = $v.height(); 

					if (self.opts.delayShowAcceleration) {
						delay = self.opts.delayShowAcceleration(delay,time,k);
					} else {
						delay = k*time;
					}
					var radius = (k+1)*(hh-adjuster);								
					var newTop = radius	* Math.sin(angle); 
					var newLeft = radius * Math.cos(angle);
					self.prevTops.push(newTop);
					self.prevLefts.push(newLeft);
					
					
					$v.delay(delay)
					.queue(function() {		
						$(this).css({"z-index":(self.liCnt - k),
									"top":self.prevTops[k]+"px",
									"left":self.prevLefts[k]+"px"})
						.dequeue();													
					}).show();
					
					if (self.opts.warpText) {						
						self._optionCssWarp($v,0);
					}
					
					$v.animate({"top":newTop+"px","left":newLeft+"px"},time,easing,function() {
						$(this).next().css({"top":newTop+"px","left":newLeft+"px"});
					});
				});
				
				this.$li.promise().done(function(){
					self.isOpen = !0;
					self.isAnimating = !1;
					self.$choice.removeClass("clicked");
					if (self.dfd) self.dfd.resolve();
				});
			}
			
			
		},
		
			
		_optionColorize : function() {
			var self = this;
			
			if (this.opts.colorBlend) { 
					
				var saturation = self.opts.colorBlendSaturation!="auto" ? self.opts.colorBlendSaturation : (Math.floor(Math.random() * 100) + 1)+"%";	
				var lightness =  self.opts.colorBlendLightness!="auto" ? self.opts.colorBlendLightness : (Math.floor(Math.random() * 100) + 1)+"%";
				
				var hslRandomColorStart = Math.floor(Math.random() * 360) + 1;
				
				if (this.opts.colorBlendStartColor!=="auto" && typeof this.opts.colorBlendStartColor == 'string') {
					var customStartColor = this.opts.colorBlendStartColor.trim();
					
					var testRgb = /^rgb\((\d+),(\d+),(\d+)\)$/i;
					var testHex = /^#([0-9A-F]{6})$/i;
					
					var Color = net.brehaut.Color;					
					if (typeof Color === "function" && (testRgb.exec(customStartColor) || testHex.exec(customStartColor))) {						
						hslRandomColorStart = new Color(customStartColor).getHue();
					} 
				}
						
				//var hslColorDelta = 360/this.opts.colorBlendAngle;
				var hslColorDelta = this.opts.colorBlendAngle;
				
				this.$li.each(function(k,v){
				
					var $li = $(this);
					var liColor = "hsl("+(hslRandomColorStart+(hslColorDelta*k))+","+saturation+","+lightness+")";
										
					if (self.opts.colorBlendStartColor!=="auto") { //new color is assigned only once on the first show
						if ($li.attr("bg-color")) {
							liColor = $li.attr("bg-color");
						}
					} 
																	
					$li.css({"background":liColor}).attr("bg-color",liColor);
					
				});
			}
			
		},
		
		_optionCssWarp : function($li, diaDegree) { 
			var self =this;
			var dia = (diaDegree!==undefined) ? diaDegree:0;
					
			if (!$li.attr("text-warp") && window.cssWarp) {
				 
				if (this.opts.warpTextSet.warpTextSerif) {
					$li.css({"font-family":"Times New Roman,Georgia,serif"});
				}
								
				cssWarp({
             		path		: {
             						radius: self.diameter/2-10, //10px is an indent from the edge of the circle.
             						angle : (180-(90-self.opts.diagonalDegree))+"deg",
             						textPosition: "inside"
             						},        		        
             		targets		: "#"+$li.attr("id"),
             		indent 		: this.opts.warpTextSet.indent,
             		kerning 	: this.opts.warpTextSet.kerning,
             		rotationMode: this.opts.warpTextSet.rotationMode,
             		align		: this.opts.warpTextSet.align,	             		
             		css			: this.opts.warpTextSet.css    		        
				});	
				
									
				$li.attr("text-warp",true);
			}
					
			return $li;	
		},
		
		
		hide : function() { 
			var self =this; 
			
			var time = this.opts.hideTime; 
			var $reversedLi = $(this.$li.get().reverse());
			var delay = 0;
			var easing = this.opts.hideEasing ? this.opts.hideEasing : "linear"; 
					
			if (this.isOpen) {
				this.$choice.addClass("clicked");
				
				$reversedLi.each(function(k,v){
					
					var prevTop = self.prevTops[self.prevTops.length-1-(k+1)]; 
					var prevLeft = self.prevLefts[self.prevLefts.length-1-(k+1)]; 
					
					if (self.opts.delayHideAcceleration) {
						delay = self.opts.delayHideAcceleration(delay,time,k);
					} else {
						delay = k*time;
					}
					
					$(v).delay(delay)
						.animate({"top":prevTop+"px","left":prevLeft+"px"},time,easing,function(){
							$(this).hide().css({"top":0,"left":0});
					});
				
				});
				
				$reversedLi.promise().done(function(){
					self.isOpen = !1;
					self.$choice.removeClass("clicked");
				});
			}
		},
		
							
		redraw : function() { 
			var self = this;
			//this.$choice.remove();
			//this.$dropDown.remove();
			this.$optList.remove();
			this.$li.remove();	
			this.redrawing = !0;		
			this._init();
		}
	};
	
	


	
	$.fn.circularSelect = function(options) { 
					
		return this.each(function(){ 
			var self = $(this),
				instance = self.data("circularSelect"),
				opts = $.extend({}, $.fn.circularSelect.defaults, typeof options == "object" && options);
				
			if (!instance) { //first time call
				
				instance = new CircularSelect(this,opts);
				self.data("circularSelect",instance);
				instance._init();
			} else { 
				if (typeof options=="string") { //if a method called 	
					var allowedMethods = ['redraw','show','hide','refreshVal'];
												
					if (($.inArray(options,allowedMethods)>-1) && (options in instance)) instance[options].call(instance);
				}	
			}
		});
		
	};
	
	
	$.fn.circularSelect.defaults = {
		choiceWidth:100,						//value in px. 'Auto' will set the longest option text's width as the choice button width, which will differ across the browsers due to the font rendering. 
		dropdownOptionWidth:100,				//value in px. 'Auto' will set the longest option text's width as the dropdown options' width and height, which will differ across the browsers due to the font rendering. 
		adjuster:50,							//overlap space between options. 0 - no overlap.		
		showTime:300,							//animation duration for each option to slide out;
		hideTime:100,							//animation duration for each option to slide in;
		diagonalDegree:90,						//enables diagonal expanding of options. Value between 0 and 360 degrees. Default is 90 degrees - vertical downwards.
		delayShowAcceleration :function(a,b,c){ //how long each option should be delayed before show. Default is an expanential decay. Set to false for no acceleration; 
			return a+= b*Math.exp(-0.3*c);
		},
		delayHideAcceleration :function(a,b,c){ //how long each option should be delayed before hiding. Default is an expanential decay. Set to false for no acceleration; 
			return a+= b*Math.exp(0.02*c); 
		},
		showEasing:"easeOutQuart",				//set to false if you don't want an easing
		hideEasing:"easeInQuart",				//set to false if you don't want an easing
		colorBlend:true,						//enable options' background color transition from the colorBlendStartColor. If set to false, the options' background will be set according to css. 	
		colorBlendStartColor:"auto",			//bgColor for the first option to blend from. Set a color in hex ('#000000') or rgb (rgb(0,0,255)) or leave 'auto' value for a random color every time the select opens.  		
		colorBlendAngle : 12,					//angle between hues of options' background - hue of the first option plus angle. Value between 0 and 360. See hsl color model. 			
		colorBlendSaturation:"100%",			//See hsl color model. Set 'auto' for random saturation.
		colorBlendLightness : "50%",			//See hsl color model. Set 'auto' for random lightness.
		choiceBgColor:"auto",						//Background color of a choice button. "auto" will set no bg programmatically.
		warpText:true, 							//enable aligning the option text along the option circle outline. see https://github.com/dirkweber/csswarp.js
		warpTextSet:{ 
			warpTextSerif	: true, 			//use of a serif font is recommended for smoother text rendering. Turn this off if you want to use a custom font.
			indent			: "0px",
			kerning 		: "0px",
            rotationMode	: "rotate",
            align			: "center",	             		
            css				: ""	
		}
		 
		
	};
	
	
	
}(jQuery));
