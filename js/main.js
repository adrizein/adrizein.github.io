function goTo(url) {
    window.open(url, '_blank');
}

function getCurrentSectionWithId() {
    var sections = document.getElementsByTagName("section");
    var currentSectionWithId = {sectionIndex:-1,id:"",distance:0};

    /*
    * Not all sections have id
    * We want to switch from one id to the other
    * as soon as the top of the section is hit
    */

    for (var i = 0; i < sections.length; i++) {
        var distance =  -(sections[i].getBoundingClientRect().y);
        if (sections[i].id && distance >= 0) {
            if(currentSectionWithId.distance == 0
                || distance <= currentSectionWithId.distance) {
                currentSectionWithId.sectionIndex = i;
                currentSectionWithId.id = sections[i].id;
                currentSectionWithId.distance = distance;
            }
        }
    }
    return currentSectionWithId;
}

function getSectionFromSectionIndex(sectionIndex) {
    var sections = document.getElementsByTagName("section");
    return sections[sectionIndex]
}


function updateState(currentSectionWithId) {
    if (currentSectionWithId.id !== location.hash.substr(1)) {
        history.pushState(null, null, "#" + currentSectionWithId.id)
        window.dispatchEvent(new Event('popstate'))
    }
}

function updateBackground(currentSectionWithId) {
    /* Where we manage the backgrounds */
    //console.log(currentSectionWithId);
    var currentBackground = document.getElementById("bg-"+currentSectionWithId.id);
    var currentSection = document.getElementById(currentSectionWithId.id);

    var paddingTop  = window.innerHeight;
    var paddingBottom = window.innerHeight; // can be changed
    var fadeInAndOutDistance = currentSection.clientHeight - paddingBottom;
    var zoomInAndOutDistance = paddingBottom/4;



    console.log("paddingTop   " + paddingTop)
    /* Here is the sequence 
    * 1 - Home, distance 0 scale of one

    * A section has a padding top of one hundred and
    * When we start the beginning of a section the background starts appearing at a scale max
    * and the previous one starts disappearing
    * When we reach the end of the section - paddingBottom
    * The zoom in zoom out occurs in the spacer

    * 2 - When reaching the end of the spacer (the beginning of the new section) we reach a zoom of zoom max
    * 3 - we stop the zoom and start fading out the background and fading in the new one at zoom max
    * 4 - when reaching the end of the section the old background is completely faded out and the new one is faded in
    * 5 - we start zooming out until we reach the scale of one at spacerheight/2 and zoom back in to reach zoom max at the end of the <spacer className=""></spacer>
    * 6 - We go back to 3
    */

   var scale = 1;
   var opacity = 1;
   var scaleMax = 6;
   var a, b;
    if (currentSectionWithId.sectionIndex == 0) {
        /* scale of 1 at distance 0
        * scaleMax at home section height + spacer height
        */
        b = 1
        a = (scaleMax-1)/(currentSection.clientHeight)
        scale = a * currentSectionWithId.distance + b
        currentBackground.style.transform = 'scale(' + scale + ')';
        currentBackground.style.opacity = 1;
    } else {
       console.log("distance " + currentSectionWithId.distance);
        console.log("fadeInAndOutDistance " + fadeInAndOutDistance);
        var previousBackground = document.getElementById("bg-"+getSectionFromSectionIndex(currentSectionWithId.sectionIndex - 1).id);
        if (currentSectionWithId.distance < fadeInAndOutDistance) {
            /* We don't scale in the section and the scale stays at scaleMax */
            scale = scaleMax
            currentBackground.style.transform = 'scale(' + scale + ')';
            previousBackground.style.transform = 'scale(' + scale + ')';
            /* We fadeIn the backgroundToPutOnTop so by the end of currentSection its opacity is one
            * One the contrary we fade the background currentlyOnTop
            */
            opacity = currentSectionWithId.distance / fadeInAndOutDistance;
            currentBackground.style.opacity = opacity;
            previousBackground.style.opacity = 1 - opacity ;
        } else {
            currentBackground.style.opacity = 1;
            previousBackground.style.opacity = 0;

            // But we zoom out and in in the spacer !
            var distanceInSpacer = currentSectionWithId.distance - fadeInAndOutDistance;
            console.log(distanceInSpacer);
            console.log(paddingBottom);
            if ( distanceInSpacer < zoomInAndOutDistance) {
                // Zoom out 
                //scale =  1 ;
                console.log("Should be zooming out");
                scale = scaleMax + (1 - scaleMax) * distanceInSpacer / zoomInAndOutDistance;
            } else if (distanceInSpacer > (paddingBottom - zoomInAndOutDistance)){
                // Zoom in 
                //scale =  scaleMax ;
                // At paddingBottom we want  scaleMax
                // At paddingBottom - zoomInAndOutDistance we want 1
                // 1 = a x (paddingBottom - zoomInAndOutDistance) + b
                // scaleMax = a x paddingBottom + b

                console.log("Should be zooming in");
            
                a = (scaleMax - 1)/(zoomInAndOutDistance);
                b = scaleMax - a * paddingBottom;
                scale =  b + a * distanceInSpacer;
            } else {
                // We are in the "palier" where the scale is one
                scale =  1;
            }
            console.log(scale);
            currentBackground.style.transform = 'scale(' + scale + ')';
        }
    }


    /*
    if(backgroundToPutOnTop != undefined ) {
        if (backgroundsOnTop.length > 0) {
            if (backgroundsOnTop.length > 0 && backgroundsOnTop[0] != backgroundToPutOnTop) {
                backgroundsOnTop[0].classList.remove("top");
                backgroundToPutOnTop.classList.add("top");
            }
        } else {
            backgroundToPutOnTop.classList.add("top");
        }

        zoomInBackground(currentSectionWithId, backgroundToPutOnTop);
    }
    */

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

    updateBackground(currentSectionWithId);

    /*
    var nextSpacer = document.getElementById(currentSectionWithId.id).nextElementSibling;
    if (nextSpacer && !nextSpacer.classList.contains('spacer')) {
        nextSpacer = null;
    }

    if (nextSpacer && nextSpacer.getBoundingClientRect().y / window.innerHeight > 0.3) {
        updateBackground(currentSectionWithId);
    } else if (nextSpacer) {
        // TODO: fondu enchainé sur fond suivant
    }
    */

    updateState(currentSectionWithId);
}


function init(){
    var currentSectionWithId = getCurrentSectionWithId();
    updateBackground(currentSectionWithId);

    var content= document.getElementById("content");
    content.addEventListener('scroll', updateOnScroll, {passive: true});
    content.addEventListener('resize', updateOnScroll, {passive: true});

    for (const node of document.getElementsByClassName('accordion-item')) {
        node.addEventListener('click', (event) => {
            if (node.classList.contains('active')) {
                node.classList.remove('active');
            }
            else {
                node.classList.add('active');
            }
        });
    }
}

window.onload = init;
