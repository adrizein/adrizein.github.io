var rightKey, leftKey, topKey, bottomKey;

$(document).ready(function () {

	//Set up the triggers for the arrow keys
	$(document).keydown(function(e){
		if (e.keyCode == 37) {
			parallax.goLeft();
		} else if(e.keyCode == 38) {
			parallax.goUp();
		} else if(e.keyCode == 39) {
			parallax.goRight();
		} else if(e.keyCode == 40) {
			parallax.goDown();
		}
	});


	parallax.add($("#Programme"))
			.add($("#Coucool"))
			.add($("#Participation"))
			.add($("#Principes"))
			.add($("#Infos"))
			.add($("#Eros"))
			.add($("#Definition"));

	// TO DO Add this part in the add function with checks
	parallax.Programme.setCoordinates([1,0]);
	parallax.Coucool.setCoordinates([0,0]);
	parallax.Participation.setCoordinates([0,1]);
	parallax.Principes.setCoordinates([0,-1]);
	parallax.Infos.setCoordinates([-1,0]);

	parallax.Eros.setCoordinates([2,0]);
	parallax.Definition.setCoordinates([3,0]);


	parallax.speed = 400;
	//var pageList = {};
	//pageList[Programme] = {vert="", parallax.Programme;

	parallax.background = $("body");

	//Clears each page navigation on load
	parallax.preload = function(){
		rightKey = leftKey = topKey = bottomKey = "";
		$(".control").show();
		resetAllButtons();
	};


	function resetAllButtons() {
		resetDownButton();
		resetTopButton();
		resetLeftButton();
		resetRightButton()
	}

	function resetDownButton() {
		$("#bottomControl").html("<i class='fa fa-chevron-down'></i>");
	}

	function resetTopButton() {
		$("#topControl").html("<i class='fa fa-chevron-up'></i>");
	}

	function resetLeftButton() {
		$("#leftControl").html("<i class='fa fa-chevron-left'></i>");
	}

	function resetRightButton() {
		$("#rightControl").html("<i class='fa fa-chevron-right'></i>");
	}


	//The fadey bits
	$("#bottomControl").mouseenter(function(){
		$("#bottomControl").html(getPageName("down"));
	}).mouseleave(resetDownButton);
	$("#topControl").mouseenter(function(){
		$("#topControl").html(getPageName('up'));
	}).mouseleave(resetTopButton);
	$("#leftControl").mouseenter(function(){
		$("#leftControl").html(getPageName('left'));
	}).mouseleave(resetLeftButton);
	$("#rightControl").mouseenter(function(){
		$("#rightControl").html(getPageName('right'));
	}).mouseleave(resetRightButton);

	//$(".control").hide();
	var isEnglish = function(){
		var ref = window.location.href;
		return ref.lastIndexOf("english")>0;
	}

	var getPageName = function(dir){
		var pageName = parallax.getPage(dir).key;
		if (isEnglish()){
			if (pageName == "Infos") pageName = "Info" ;
			if (pageName == "Principes") pageName = "Principles" ;
		}
		return pageName;
	}

	parallax.fromUrl().show();

	$.getScript("./js/jquery.touchSwipe.min.js" 
		/*
		,function() {			
			//Enable swiping...
			$("#pageContainer").swipe( {
				//Generic swipe handler for all directions
				swipe:function(event, direction, distance, duration, fingerCount, fingerData){
					if (direction =="left") {
						parallax.goRight();
					} else if (direction =="right") {
						parallax.goLeft();
					} else if (direction =="up") {
						parallax.goDown();
					} else if (direction =="down") {
						parallax.goUp();
					}
				},
				//Default is 75px, set to 0 for demo so any distance triggers swipe
			   threshold:150
			});
		}
		*/
	);
});


function openMenu() {
    document.getElementById('sidebar-wrapper').setAttribute('class','active');
    document.getElementById('pageContainer').setAttribute('class','inactive');
}

function closeMenu() {
    document.getElementById('sidebar-wrapper').removeAttribute('class');
    document.getElementById('pageContainer').removeAttribute('class','inactive');
}

function clickMenu(ref){
    parallax.goTo(ref);
    closeMenu();

}

function clickEnvelope(){
    $('#mc-embedded-subscribe').click();
}

var isScrolling = false;



document.addEventListener('mousewheel',function(event){

	var presentSection = document.getElementById(parallax.current.key);

	var isBottom = presentSection.scrollTop 
		+ presentSection.clientHeight
		>= (presentSection.scrollHeight-1) ;
	var isTop = presentSection.scrollTop == 0;
		
	var isScrollingDown = event.wheelDeltaY < -100;
	var isScrollingUp = event.wheelDeltaY > 100;
	var isScrollingLeft = event.wheelDeltaX < -100;
	var isScrollingRight = event.wheelDeltaX > 100;

	if( isScrollingDown && isBottom && !isScrolling) {
            parallax.goDown();
	}
	if( isScrollingUp && isTop && !isScrolling) {
            parallax.goUp();
	}
	if( isScrollingLeft && !isScrolling) {
            parallax.goRight();
	}
	if( isScrollingRight && !isScrolling) {
            parallax.goLeft();
	}

}, false);
