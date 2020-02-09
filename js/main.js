function getCurrentSectionWithId() {
    var sections = document.getElementsByTagName("section");
    var currentSectionWithId = {id:"",distance:0};

    /*
    * Not all sections have id
    * We want to switch from one id to the other
    * as soon as the top of the section is hit
    */

    for (var i = 0; i < sections.length; i++) {
        var distance = (-1)*sections[i].getBoundingClientRect().y
        if (sections[i].id && distance >= 0) {
            if(currentSectionWithId.distance == 0 
                || distance <= currentSectionWithId.distance) {
                currentSectionWithId.id = sections[i].id;
                currentSectionWithId.distance = distance;
            }
        }
    }
    return currentSectionWithId;
}


function updateState(currentSectionWithId) {
    if (currentSectionWithId.id !== location.hash.substr(1)) {
        history.pushState(null, null, "#" + currentSectionWithId.id)
        window.dispatchEvent(new Event('popstate'))
    }
}

function updateBackground(currentSectionWithId) {
    /* Where we manage the backgrounds */

    

    var backgroundsOnTop = document.getElementsByClassName("top");
    var backgroundToPutOnTop = document.getElementById("bg-"+currentSectionWithId.id);

    if(backgroundToPutOnTop != undefined ) {
        if (backgroundsOnTop.length > 0) {
            if (backgroundsOnTop.length > 0 && backgroundsOnTop[0] != backgroundToPutOnTop) {
                backgroundsOnTop[0].classList.remove("top");
                backgroundToPutOnTop.classList.add("top");
            }
        } else {
            backgroundToPutOnTop.classList.add("top");
        }

        console.log("Zoom in")
        zoomInBackground(currentSectionWithId, backgroundToPutOnTop);
    }

}

function zoomInBackground(currentSectionWithId, background){
    var currentSection = document.getElementById(currentSectionWithId.id);
    
    /* The fun part */
    var zoomMax = 6;
    var focusDistance = 0; //currentSection.clientHeight/2;
    var blurMax = 2;

    var scale = 1;
    if (currentSectionWithId.distance < focusDistance) {
        /* ZOOM OUT */
        /* At distance 0 we want a scale of ZoomMax,
        * When distance == focusDistance we want a scale of 1
        * a * 0 + b = ZoomMax
        * a * focusDistance + ZoomMax  = 1
        */
       scale =  zoomMax + (1 - zoomMax)/focusDistance * currentSectionWithId.distance
    } else {
        /* ZOOM IN */
        /* At distance focusDistance we want a scale of 1,
        * When distance == currentSection.clientHeight we want a scale of zoom max
        * a * focusDistance + b = 1
        * a * clientHeight + b = ZoomMax 
        * a * (focusDistance - clientHeight) = 1 - ZoomMax
        * b = 1 - a * focusDistance
        */
       var a = (1 - zoomMax)/(focusDistance - currentSection.clientHeight);
       var b = 1 - a * focusDistance;
       scale =  b + a * currentSectionWithId.distance
    }
    background.style.transform = 'scale(' + scale + ')';

    /* At distance 0 we want a blur of 0px,
    * When distance == currentSection.clientHeight we want a blur of zoom max
    * a * 0 + b = 0
    * a * clientHeight = blurMax 
    */
    var blur =  blurMax/currentSection.clientHeight * currentSectionWithId.distance
    background.style.filter = 'blur(' + blur + 'px)';

}

function updateOnScroll() {
    var currentSectionWithId = getCurrentSectionWithId();

   updateState(currentSectionWithId);
   updateBackground(currentSectionWithId);
}


function init(){
    var currentSectionWithId = getCurrentSectionWithId();
    updateBackground(currentSectionWithId);

    var content= document.getElementById("content");
    content.addEventListener('scroll', updateOnScroll);
}

window.onload = init;
