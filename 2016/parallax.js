window.onload = function(){
	if (typeof jQuery === 'undefined') {
		alert("ERROR: parallax.js requires jQuery.");
	} else {
		var updateparallax = function(){
			parallax.width = window.innerWidth;
			parallax.height = window.innerHeight;
		}
		updateparallax();
		$(window).resize(function(){updateparallax();});
	}
}

var parallaxPage = function(name, pageHtml){
	return{
		key: name,
		page : pageHtml,
		coordinates : '',
		right  : function(callback){return this.transition({left:parallax.width,top:0}  ,{left:-parallax.width,top:0} ,callback);},
		left   : function(callback){return this.transition({left:-parallax.width,top:0} ,{left:parallax.width,top:0}  ,callback);},
		top    : function(callback){return this.transition({left:0,top:-parallax.height},{left:0,top:parallax.height} ,callback);},
		bottom : function(callback){return this.transition({left:0,top:parallax.height} ,{left:0,top:-parallax.height},callback);},

		transition : function(locationNew, locationOld, callback){
			if(!parallax.sliding){
				parallax.sliding = true;
				var thisPage = this;
				if(parallax.current !== this){
					this.hide(locationNew);
					if(typeof parallax.preload === 'function'){
						parallax.preload();
					}
					if(typeof this.preload === 'function'){
						this.preload();
					}
					this.slide({left:0,top:0}, function(){
						thisPage.makeCurrent();
						parallax.sliding = false;
						if(typeof callback === 'function'){
							callback();
						}
					});
					if(typeof parallax.current !== 'undefined'){
						parallax.current.slide( locationOld,
							function(){
								parallax.sliding = false;
							}
						);
					}
					parallax.slideBackground(locationNew);
				}
			}
			return this;
		},

		slide : function(css, callback){
			this.page.css("display", "block");
			this.page.stop().animate(css, parallax.speed, parallax.easing,
				function(){if(typeof callback === "function"){callback();}
			});
		},

		hide : function(newLocation){
			newLocation = newLocation || {left:parallax.width,top:0}; //defaults left off screen
			this.page.css("display", "none");
			this.page.css(newLocation);
			return this;
		},

		show : function(newLocation){
			newLocation = newLocation || {left:0,top:0}; //defaults on screen
			if(typeof parallax.current !== 'undefined'){
				parallax.current.hide();
			}
			this.makeCurrent();
			this.page.css("display", "block");
			this.page.css(newLocation);
			return this;
		},

		makeCurrent : function(){
			if(this === parallax.current){
				return false;
			}else{
				if(typeof parallax.current !== 'undefined'){
					parallax.current.hide();
					parallax.last = parallax.current;
				}
				if(parallax.updateUrl === true){ this.updateUrl(); }
				if(typeof parallax.onload == 'function'){ parallax.onload();}
				if(typeof this.onload === 'function'){ this.onload();}
				parallax.current = this;

				//Custom Behaviour
				if(this.key == "Coucool") {
					alert("pouet");
					$(".description").show();
				} else {		
					$(".description").hide();
				}
			}	
			return true;
		},

		setCoordinates : function (coordinates) {
			this.coordinates = coordinates ;
		},

		updateUrl : function(){
			var url = document.URL;
			url = (url.lastIndexOf("#") === -1)? url : url.substring(0, url.lastIndexOf("#"));
			window.location.href = url + "#" + this.key;
		},

		ackbar : function(){ alert(this.key + " thinks it's a trap!"); return this;},
	};
};

var parallax = {
	speed : 2000,
	easing : 'swing',
	sliding : false,
	unusableNames : ["last", "current", "background","onload","updateUrl", "preload"],
	//scaling : 0.15,
	updateUrl : true,

	add : function(key,object) {
		var check = true;
		if(typeof key === 'object'){
			try{
				object = key
				key = key.attr('id');
			} catch(err){
				check = false;
				alert("ERROR:Page object lacks an id");
			}
		}else if(typeof key !== 'string'){
			check = false;
			alert("ERROR:undefined key");
		}

		if(typeof object !== 'object'){
			check = false;
			alert("ERROR:undefined page");
		}

		if(check){
			validKeyName = true;
			for(propName in this){
				if(propName === key) {
					validKeyName = false;
				}
			}
			if($.inArray(key, this.unusableNames) !== -1){
				validKeyName = false;
			}
			if(validKeyName){
				this[key] = parallaxPage(key,object);
				this[key].hide();
				this[key].page.css("position","absolute");
			}else{
				alert("ERROR:'"+key+"' cannot be used as a page identifier");
			}
		}
		return this;
	},

	fromUrl : function(){
		var temp = document.URL.lastIndexOf("#")
		if(temp !== -1){
			pageName = document.URL.substring(temp + 1, document.URL.length);
			if(parallax.hasOwnProperty(pageName)){
				return parallax[pageName];
			}
		}
		return parallax.Coucool;
	},

	slideBackground : function(newLocation){
		if(typeof this.background !== 'undefined' && typeof newLocation !== 'undefined'){
			$(this.background).animate({
				'background-position-x': '+=' + -newLocation.left * parallax.scaling + 'px',
				'background-position-y': '+=' + -newLocation.top * parallax.scaling + 'px',
				}, parallax.speed, parallax.easing);
		}
	},

	getPageByCoordinates : function(coordinatesToFind){
		for (var key in parallax) {
			if (this[key].coordinates
				&& this[key].coordinates[0] == coordinatesToFind[0] 
				&& this[key].coordinates[1] == coordinatesToFind[1]) {
				return this[key];
			} 
		}
	},

	getCurrentPageName : function(){
		if(this.current) {
			return this.current.key;
		} else {
			return "Coucool";
		}
	},

	//Need to create a goTo
	goTo : function(goToPage) {
		var goToCoordinates = goToPage.coordinates;
		var currentCoordinates = this.current.coordinates;
		if (currentCoordinates[0]< goToCoordinates[0]) {
			goToPage.right();
		} else if (currentCoordinates[0] > goToCoordinates[0]) {
			goToPage.left();
		} else if (currentCoordinates[1] < goToCoordinates[1]) {
			goToPage.bottom();
		} else if (currentCoordinates[1] > goToCoordinates[1]) {
			goToPage.top();
		}
	},


	goLeft : function(){
		this.getPage("left").left();
	},

	goRight : function(){
		this.getPage("right").right();
	},

	goUp : function(){
		this.getPage("up").top();
	},

	goDown : function(){
		this.getPage("down").bottom();
	},

	getPage : function (way) {
		var currentCoordinates = this.current.coordinates;
		var nextHorizontal = 0;
		var nextVertical = 0;
		if (way == "left") {
			var nextHorizontal = (currentCoordinates[0]-1) < -1 ? 1 : (currentCoordinates[0]-1);
		} else if (way == "right") {
			var nextHorizontal = (currentCoordinates[0]+1) > 1 ? -1 : (currentCoordinates[0]+1);
		} else if (way == "up") {
			var nextVertical = (currentCoordinates[1]-1) < -1 ? 1 : (currentCoordinates[1]-1);
		} else if (way == "down") {
			var nextVertical = (currentCoordinates[1]+1) > 1 ? -1 : (currentCoordinates[1]+1);
		}
		return this.getPageByCoordinates([nextHorizontal, nextVertical])
	}

};
