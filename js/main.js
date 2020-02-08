const backgrounds = {
    'Home':"1 - Home.jpg", 
    'Principes':'2 - Principes.jpg',
    'Infos':'3 - Infos.jpg',
    'Contributions':'4 - Contributions.jpg',
    'Curiosites':'5 - Curiosites.jpg'
}


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
    var backgroundContainer = document.getElementById("backgroundContainer");
    var backgoundsDisplayed = backgroundContainer.getElementsByTagName("img");
    var imageSourceToDisplay = "assets/" + backgrounds[currentSectionWithId.id];
    

    if (backgoundsDisplayed.length === 0) {
        addBackground(imageSourceToDisplay);
    }
    else if (backgoundsDisplayed[backgoundsDisplayed.length-1].src != imageSourceToDisplay) {
        switchBackgrounds(imageSourceToDisplay);
    } 
    console.log("Zoom in")
    zoomInBackground(currentSectionWithId, backgoundsDisplayed[backgoundsDisplayed.length-1]);

}

function createBackground(imageSource) {
    var img = document.createElement("img");
    img.src = imageSource;
    img.classList.add('background');
    return img;
}

function removeBackground(){
    var backgroundContainer = document.getElementById("backgroundContainer");
    var backgoundsDisplayed = backgroundContainer.getElementsByTagName("img");
    backgoundsDisplayed[backgoundsDisplayed.length-1].remove();
}

function addBackground(imageSource){
    var backgroundContainer = document.getElementById("backgroundContainer");
    var background = createBackground(imageSource);
    backgroundContainer.appendChild(background);
}

function switchBackgrounds(imageSource) {
    /* TO IMPROVE to avoid blinking, to start at zoomMax etc... */
    removeBackground();
    addBackground(imageSource);
}

function zoomInBackground(currentSectionWithId, background){
    /* The fun part */
    var zoomMax = 6;
    var currentSection = document.getElementById(currentSectionWithId.id)

    /* At distance 0 we want a scale of 1,
    * When distance == currentSection.clientHeight we want a scale of zoom max
    * a * 0 + b = 1
    * a * clientHeight + 1 = ZoomMax 
    * 
    */

    var scale =  1 + (zoomMax - 1)/currentSection.clientHeight * currentSectionWithId.distance
    background.style.transform = 'scale(' + scale + ')';

}

function updateOnScroll() {
    var currentSectionWithId = getCurrentSectionWithId();

    console.log("updating on scroll");
    console.log(currentSectionWithId );
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


function isNavBackgroundUpdateNeeded() {
    /*
    * If we don't need to update the nav everywhere !
    */
    var sectionWithDifferentBackground = document.getElementById("prices");
    var nav = document.getElementsByTagName("nav")[0];
    var distance = (-1)*sectionWithDifferentBackground.getBoundingClientRect().y;
    var margin = 400;
    var navBackgroundUpdateNeeded = distance >= (-1)*nav.clientHeight - margin 
                                    && distance <= sectionWithDifferentBackground.clientHeight + margin;
    return (navBackgroundUpdateNeeded);
} 

function updateNavBackground() {
    /*
    * Here comes the funcky part !
    * We want the nav bar background 
    * to change progressively
    * to mix with the section background
    */

    var nav = document.getElementsByTagName("nav")[0];
    var sections = document.getElementsByTagName("section");
    var currentSection = sections[0];
    var bg_color_current = window.getComputedStyle(currentSection,null).getPropertyValue('background-color');

    for (var i = 0; i < sections.length; i++) {
        var distance = sections[i].getBoundingClientRect().y;
        if(distance >= 0) {
            /*
            * When distance < 0 we are below this section
            * Meaning that 
            * As soon as distance >=0 then we are in section i-1
            */
            currentSection = sections[i-1]; 
            bg_color_current = window.getComputedStyle(currentSection,null).getPropertyValue('background-color');
            
            if (distance <= nav.clientHeight) {
                /* We are at an intersection 
                * between section i and section i-1
                * distance = 0 when nav is completely in section i
                * distance = navClientHeight when nav is completely in section i-1
                */
                var percent = Math.trunc((distance/nav.clientHeight)*100);
                var bg_color_next = window.getComputedStyle(sections[i],null).getPropertyValue('background-color');
                var linear_gradient = `linear-gradient(${bg_color_current} ${percent}%,${bg_color_next} ${percent}%)`;
                nav.style.background = linear_gradient;
            } else {
                nav.style.background = bg_color_current;
            }
            return;
        }
    }
} 
