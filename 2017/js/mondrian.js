
	// HELPERS TO CREATE THE MONDRIAN

	var nb_rectangles = 8,
		nb_visible_rectangles = 6,
		separation_limit_around_50 = 10
 
	var endBoxes = [];

	var contents = [$("#Coucool"),
			$("#Participations"),
			$("#Infos"),
			$("#Benevoles"),
			$("#Principes"),
			$("#Curiosites"),
			$("#Eros"),
			$("#Definitions")]; // By order of decreasing importance

	var firstSplits = [];
	var firstPercents = [];
	var firstEndBoxes = [];
	var artworkEndBoxId;


	// HELPERS

	function shuffle(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;
	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {
	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;
	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }
	  return array;
	}

	function pickInArray(array) {
		return array[Math.floor(Math.random() * (array.length))]
	}

	var rose ='rgba(234,115,115,1)',
		green = 'rgba(57, 127, 145, 1)',
		red = 'rgba(214, 38, 84, 1)',
		dark_blue = 'rgba(25, 23, 78, 1)',
		light_blue = 'rgba(49, 165, 180, 1)',
		orange = 'rgba(229,120,62, 1)'
    var colors = shuffle([rose, green, red, dark_blue, light_blue, orange, 'pink', 'yellow']);


  	function pickAnEndBox(frame){
	    //var endBoxes = $frame.find(".endBox");
	    var possibleRectangles = [];
	    // Here we want to limit the depth of the endbox that we want to split
	    // Depth 1 > up to 2 rectangle, 2 > 4 rectangles so 2^max_depth >= nb_rectangles
	    // If we want our tree to be with all his branch the same size we choose 
	    for (var i = 0; i < endBoxes.length; i++) { // We don't want to use the endBoxes[0] to keep it for Coucool
	    	var endBox = endBoxes[i];
	    	if (endBox.id.length<=3 && endBox.id != artworkEndBoxId) {
	    		possibleRectangles.push($("#"+endBox.id))
	    	}
	    }
	    if (possibleRectangles.length<1) {return frame;}
	    var rectangle_index = Math.floor(Math.random() * (possibleRectangles.length));
	    var rectangle = $(possibleRectangles[rectangle_index]);
	    return rectangle;
  	};

  	function pickASplit(endBox){
  		var split;
  		if (endBox.attr('class')=="frame") {
  			// The first split is random
  			split = pickInArray(["horizontal","vertical"]);
  		} else {
  			// We alternate the following splits
  			var endBoxPosition = getBoxPosition(endBox)
  			if(endBoxPosition == "top" || endBoxPosition == "bottom") {
  				split = "vertical"
	  		} else {
	  			split = "horizontal";
	  		}
  		}
	    return split;
  	};

  	function pickASplitPercent(){
  		var randomPercent = Math.floor(Math.random() * (100 + 1));
  		var isRandomPercentAround50 = Math.abs(50-randomPercent)<separation_limit_around_50;
  		var splitPercent =  isRandomPercentAround50 ? randomPercent : (50 + Math.sign(50-randomPercent)*separation_limit_around_50) ;
  		return splitPercent;
  	};

	function splitARectangleInTwo(rectangle, split, percent){
		var div1;
    	var div2;
    	if (split=="vertical"){
    		div1 = endBox(rectangle,"left", percent);
    		div2 = endBox(rectangle, "right", 100-percent);
    	} else {
    		div1 = endBox(rectangle,"top", percent);
    		div2 = endBox(rectangle, "bottom", 100-percent);
    	}
		// We remove the endBox Class of the rectangle
    	rectangle.append(div1);
    	rectangle.append(div2);
    	rectangle.removeClass("endBox");
    	rankEndBoxes($('.frame'))
	}

	function endBox(parent, position, percent){
		var id = parent.attr('id') ? parent.attr('id') : "";
		var positionString = "" + position;
		var positionFirstLetter = positionString.substr(0,1);
		var endBox = $("<div></div>")
		var attributeToApplyPercent = (position == "bottom" || position == "top") ? 'height' : 'width';
		endBox.addClass("box");
		endBox.css(attributeToApplyPercent, percent + "%");
		endBox.addClass("endBox");
		endBox.addClass(positionString);
		endBox.attr("id",id+positionFirstLetter);
		return endBox;
	}

	function getArtworkPerfectRatio() {
		// TO DO IMPROVE DRASTICALLY !!!
		var artWorkWidth = 1600;
		var artWorkHeight = 887;
		var artWorkRatio = artWorkWidth / artWorkHeight; // 1,53

		var windowWidth = $(window).width() //1280 
		var windowHeight = $(window).height() // 680
		var windowRatio = windowWidth / windowHeight; //1,88

		var firstPercentValue;
		var firstPercent;
		var secondPercentValue;
		var secondPercent;

		if($(window).width() < 800) {
			firstPercentValue = 100 * windowRatio / artWorkRatio
			if (firstPercentValue < 90) {
				firstSplits = ["horizontal"];
				firstPercent = pickInArray([firstPercentValue,(100-firstPercentValue)])
				firstPercents = [firstPercent];
				artworkEndBoxId = (firstPercent == firstPercentValue) ? "t" : "b";
			}
		} else {
			// vertical and 75 means that the artwork will have a width of window.width * 0.75
			// Second
			firstPercentValue = 65
			firstPercent = pickInArray([firstPercentValue,(100-firstPercentValue)])
 
			secondPercentValue = firstPercentValue * windowRatio / artWorkRatio

			if (secondPercentValue < 90) {
				firstSplits = ["vertical","horizontal"]
				secondPercent = pickInArray([secondPercentValue,(100-secondPercentValue)])
				firstPercents = [firstPercent , secondPercent];
				var firstLetter = (firstPercentValue == firstPercent) ? "l" : "r";
				var secondLetter = (secondPercentValue == secondPercent) ? "t" : "b";
				artworkEndBoxId = firstLetter + secondLetter;
			}
		}
	}

	function generateMondrian(frame){
		getArtworkPerfectRatio();
		// We want one box to be 60% of the area and to be left alone
		for ( var j = 0; j < firstSplits.length; j++ ) {
			var endBoxToSplit = (j == 0) ? frame : $("#" + endBoxes[(j-1)].id)
			splitARectangleInTwo(endBoxToSplit, firstSplits[j] , firstPercents[j]);
		}

		//Apply the artwork in the right endBox


		for ( var j = (firstSplits.length + 1); j < nb_rectangles; j++ ) {
			var rectangleToSplit = pickAnEndBox(frame);
			var split = pickASplit(rectangleToSplit);
		    var splitPercent = (j<nb_visible_rectangles) ? pickASplitPercent() : 0;
			splitARectangleInTwo(rectangleToSplit, split, splitPercent);
    	}

    	    	/*
		splitARectangleInTwo(frame, 'vertical', 70);
		splitARectangleInTwo($("#L"), 'horizontal', 40);
		splitARectangleInTwo($("#LB"), 'vertical', 30);
		*/
	}

	function getBoxPosition(box){
		var classes = box.attr('class').split(" ");
		var positions = classes.filter(function(n) {
    		return ["top", "bottom", "left", "right"].indexOf(n) != -1;
		});
		return positions[0];
	}

	function getBoxArea(box){
		var area = box.height() * box.width();
		return area;
	}

	function getBoxDepth(box){
		var depth = box.attr('id') ? box.attr('id').length : 0;
		return depth;
	}

	function getComplementaryBox(box){
		var complementaryBox;
		var id = box.attr('id');
		var id_last_caracter = id.substr(id.length - 1);
		var id_trunk = id.substr(0, id.length - 1);
		var complementary_character;
		switch(id_last_caracter) {
		    case "t": complementary_character="b"; break;
		    case "b": complementary_character="t"; break;
		    case "l": complementary_character="r"; break;
		    case "r": complementary_character="l"; break;
		}
		complementaryBox = $("#" + id_trunk + complementary_character);
		return complementaryBox;
	}

	function rankEndBoxes(frame){
		endBoxes = [];
		var rankedEndBoxes = [];
		var possibleRectangles = frame.find(".endBox");
		var j =0;

		possibleRectangles.each(function(){
			var boxId = $(this).attr("id");
			var boxArea = getBoxArea($(this));
			var boxIdAndArea = {
				'id': boxId,
				'area': boxArea
			}
			endBoxes = endBoxes.concat(boxIdAndArea);
		});
		endBoxes.sort(function(a,b){ return (b.area - a.area) });
	}


	// MAIN

	var $frame = $('.frame');
	var contentId = getContentIdFromUrl();

	$frame.each(function(){
		var $thisFrame = $(this);
		if(contentId == "Coucool") {
			$frame.css('display', 'none');
			$('.waiter_screen').css('display', 'block');
		}
		generateMondrian($thisFrame);
		addContentAndBackground();
		goToUrl();
	});

	window.onload = function() {
		$frame.css('display', 'block');
		$('.waiter_screen').css('display', 'none');
		//console.log(getArtworkPerfectRatio())
		//addCanvas($frame);
		if (contentId == "Coucool") {
			setTimeout(backToInitial, 500);
		}
	}
	
	$(document).ready(function () {
		$.getScript("./js/jquery.touchSwipe.min.js" );
	});


	// HELPERS TO ADD CONTENT
	function addContentAndBackground() {
		artworkEndBoxId = artworkEndBoxId ? artworkEndBoxId : endBoxes[0].id;
		$("#"+artworkEndBoxId).append(contents[0]);
		var endBoxesWithoutArtwork = endBoxes.filter(function(el) {
		    return el.id !== artworkEndBoxId;
		});
		console.log(endBoxesWithoutArtwork);
		console.log(contents);
		j=0
		while (contents[j+1] && endBoxesWithoutArtwork[j] && j<nb_rectangles) {
			var $endBox  = $("#"+endBoxesWithoutArtwork[j].id);
			$endBox.append(contents[j+1]);
			//$endBox.css('background-image', 'url(assets/coucool00' + j + ".jpg");
			j++;
		}
	}

	function addCloseButton() {
		var $closeButton = $("#closeButton");
		var increasing_content_id = $increasingRectangle.children()[0].id
		var increasing_content = $($increasingRectangle.children()[0]);
		if (increasing_content_id.localeCompare("Coucool") !=0) {
			$($increasingRectangle.children()[0]).append($("#closeButton"));
			$closeButton.show();
		}
	}

	function removeCloseButton(){
		var $closeButton = $("#closeButton");
		$closeButton.hide();
	}

	function showDetails(){
		var increasing_content_id = $increasingRectangle.children()[0].id
		if (increasing_content_id == "Curiosites") {
			$increasingRectangle.find(".details").fadeIn(details_fade_in_delay);;
		} else {
			$increasingRectangle.find(".details").fadeIn(details_fade_in_delay).css('display','table-cell');;
		}
		
	}

	function removeDetails(){
		$frame.find(".details").fadeOut(details_fade_in_delay);
	}


	function removeAll(){
		removeCloseButton();
		removeDetails();
	}


	//DYNAMIC BEHAVIOUR

	// TO DO : should only have a setIncreasingEndbox function

	var pollingDelay = 100;
	var areaThreshold = 20,
		details_fade_in_delay = 200,
		delay_before_beginning_decrease = 1000;


	var force_decrease = false;
	var moving = false ;
	var $increasingRectangle ;
	var increasingWidth = 0;
	var increasingHeight = 0;
	

	function goToContent(contentId){
		backToInitial();
		//console.log("On y est");
		var $index_endBox = $("#"+ contentId).parent();
		increaseWithoutMotion($index_endBox);
	}

	function setUrl(location) {
		document.location.href = "#" + location ;
		force_decrease = false;
		moving = false;
		goToUrl();
	}

	function goToUrl(){
		var contentId = getContentIdFromUrl();
		goToContent(contentId);
	}

	function getContentIdFromUrl(){
		var temp = document.URL.lastIndexOf("#");
		if(temp !== -1){
			pageName = document.URL.substring(temp + 1, document.URL.length);
			if (pageName != "") {
				return pageName
			} 
		}
		return "Coucool"

	}

	function addMotion() {
		$frame.find(".box").each(function() {
			$(this).addClass("motion")
		});
	}

	function removeMotion() {
		$frame.find(".box").each(function() {
			$(this).removeClass("motion")
		});
	}

	function increase() {
		if ($(this).attr('id') != artworkEndBoxId) {
			if(!force_decrease) {
				setMoving(true)
				setIncreasingEndBox($(this));
			}
		}
	}

	function increaseEndBox() {
		var depth = $increasingRectangle.attr('id') ? $increasingRectangle.attr('id').length : 0;
		var rectangleToIncrease = $increasingRectangle
		for ( var j = 0; j < depth; j++ ) {
			//if (!moving) { whileMoving();}
			setMoving(true)
			var position = getBoxPosition(rectangleToIncrease );
			var complementaryBox = getComplementaryBox(rectangleToIncrease );	
			if (position == "bottom" || position == "top") {
				rectangleToIncrease .addClass("inCreasingHeight");
				complementaryBox.addClass("deCreasingHeight");
			}
			else if (position == "left" || position == "right") {
				rectangleToIncrease .addClass("inCreasingWidth");
				complementaryBox.addClass("deCreasingWidth");
			}	
			rectangleToIncrease = rectangleToIncrease.parent()
		}
	}

	function decrease(){
		console.log(moving)
		console.log(force_decrease);
		if (moving || force_decrease) {
			setMoving(true)
			//if (!moving) { whileMoving();}
			//removeDetails();
			//removeCloseButton();
			document.location.href = "#";
			$frame.find(".box").each(function() {
				$(this).parent().children()
		  			.removeClass("inCreasingHeight")
		  			.removeClass("deCreasingHeight")
		  			.removeClass("inCreasingWidth")
		  			.removeClass("deCreasingWidth")
			})
		}
	}

	function setIncreasingEndBox(endBox) {
		if ($increasingRectangle != $(endBox)) {
			$increasingRectangle = $(endBox);
			//removeDetails();
			//removeCloseButton();
			//showDetails();
			if ($increasingRectangle && $increasingRectangle[0] && $increasingRectangle[0].children[0]) {
				document.location.href = "#" + $increasingRectangle[0].children[0].id;
				increaseEndBox();
			}
		}
	}

	function increaseWithoutMotion(endBox) {
		removeMotion();
		setIncreasingEndBox(endBox);
		setTimeout(addMotion, 50);
	}

	function backToInitial(){
		force_decrease = true;
		console.log("Should be decreasing");
		//setIncreasingEndbox(null);
		decrease();
		setTimeout(function(){ force_decrease=false ;}, 3000)
	}

	function setMoving(value) {
		if (moving != value) {
			if (value) {
				//starting to move
				//console.log("Starting");
				moving = true;
				setTimeout(whileMoving, pollingDelay)
			} else {
				//stopping
				//console.log("Stopped");
				moving = false;
				whenStopped();
			}
		}
	}

	function whileMoving() {
		if (moving) {
			if ($increasingRectangle && increasingHeight != $increasingRectangle.height() || increasingWidth != $increasingRectangle.width()) {
				//console.log("Still moving");
				increasingHeight = $increasingRectangle.height();
				increasingWidth = $increasingRectangle.width();
				if(isSingleRectangleView(0.8) && $increasingRectangle[0].children[0].id != "Coucool") {
					showDetails();
					addCloseButton();
					/*
					console.log("Is single rectangle")
					showDetails();
					addCloseButton();
					*/
				} else {
					removeAll();
				}
				setTimeout(whileMoving, pollingDelay)
			} else {
				setMoving(false);
			}	
		} else {
			setMoving(true);
		}
	}

	function whenStopped() {
		if(isSingleRectangleView(0.80)) {
			showDetails();
			addCloseButton();
			console.log("We are in");
			force_decrease = false;
		} else {
			removeAll();
		}
	}

	function isSingleRectangleView(singleRectangleViewLimitRatio) {
//(separation_limit_around_50+50)/100
		return ($increasingRectangle.height() >= $(window).height()* singleRectangleViewLimitRatio && $increasingRectangle.width() >= $(window).width() * singleRectangleViewLimitRatio)
	}

	$( ".endBox" )
		.mouseenter(increase)
	  	.mouseleave(decrease)
		.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
		});

	$(window).resize(function(){

	});



	// To repair the glitches in the background
	function addCanvas(frame) {
		j=0;
		while ($("#picture"+j).length > 0 && j<nb_rectangles) {
			//if (j==2) {
				var $endBox  = $("#"+endBoxes[j].id);
				var img = document.getElementById("picture"+j);
				var endBox = document.getElementById(endBoxes[j].id);
				var color = pickABackgroundColor();
				endBox.className = endBox.className + " " + color;
				//var img = $("#content"+j).find( "img" ).first();
				//Add the canvas
				//console.log(img);
				//Neet to create the div with the class bg and add this div
				var canvas = canvasFromPicture(img);
				canvas.id = "canvas" + j;
				tintImage(canvas, color);
				var canvasContainer = document.createElement('div'); //$("<div class='canvasContainer'> Pouet pouet</div>")
				canvasContainer.className = "canvasContainer";
				canvasContainer.appendChild(canvas)
				endBox.appendChild(canvasContainer);
				//adaptToWindow(canvas);
				//window.setInterval(function() {adaptToParent(canvas);},20);
				//window.setInterval(function() {adaptToWindow(canvas);},5);
			//}
			j++;
		}
		adaptAllCanvas();
		window.setInterval(function() {adaptAllCanvas();},1);
	}

	function adaptAllCanvas() {
		$frame.find("canvas").each(function() {
			adaptToWindow($(this).get(0));
		})
	}

	function adaptToWindow(canvas) {
		// To keep the right image ratio
		var ratio_canvas = canvas.width/canvas.height;
		var ratio_window = parseInt(window.innerWidth)/ parseInt(window.innerHeight) ;
		if (ratio_window > ratio_canvas) {
			// Here the height of the canvas will be longer
			canvas.style.width = window.innerWidth;
			canvas.style.height = window.innerWidth/ratio_canvas;
		} else {
			canvas.style.height = window.innerHeight;
			canvas.style.width = window.innerHeight * ratio_canvas ;
		}
		// To have it centered 
		var difference_height = parseInt(window.innerHeight) - parseInt(canvas.style.height);
		var difference_width= parseInt(window.innerWidth) - parseInt(canvas.style.width);
		//canvas.style.marginLeft = difference_width /2;
		//canvas.style.marginTop = difference_height/2;//(canvas.style.height)/
		// To have an imression of window opening
		var $parentEndBox = $("#" + canvas.parentElement.parentElement.id);
		canvas.style.marginLeft = difference_width/2 - $parentEndBox.offset().left;
		canvas.style.marginTop = difference_height/2 - $parentEndBox.offset().top;
	}

