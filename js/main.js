function goTo(url) {
    window.open(url, '_blank');
}

function getCurrentSectionWithId() {
    var currentSectionWithId = { sectionIndex: -1, id: "", distance: 0 };
    /*
    * Not all sections have id
    * We want to switch from one id to the other
    * as soon as the top of the section is hit
    */

    sections.forEach((section, i) => {
        var distance = -(section.getBoundingClientRect().y);
        if (section.id && distance >= 0) {
            if (currentSectionWithId.distance == 0 || distance <= currentSectionWithId.distance) {
                currentSectionWithId.sectionIndex = i;
                currentSectionWithId.id = sections[i].id;
                currentSectionWithId.distance = distance;
            }
        }
    });
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

var afterTextLength = 1200;
var blurMax = 8;
var scaleMax = 3;

var sequenceAfterText = [
    {'name':'start', 'blur':blurMax, 'scale':scaleMax},
    {'name':'unBlurring', 'distance': afterTextLength/6,'blur':0, 'scale':scaleMax},
    {'name':'zoomOut', 'distance': afterTextLength/6, 'blur':0, 'scale':1},
    {'name':'focus', 'distance': afterTextLength/6, 'blur':0, 'scale':1},
    {'name':'zoomIn', 'distance': afterTextLength/6, 'blur':0, 'scale':scaleMax},
    {'name':'switching', 'distance': afterTextLength/6, 'blur':0, 'scale':scaleMax},
    {'name':'blurring', 'distance': afterTextLength/6, 'blur':blurMax, 'scale':scaleMax}
]

function getDistancesArray(){
    var distancesArray = [];
    var distance = 0
    sequenceAfterText.forEach(function (limit) {
        if (limit['distance']) {
            distance = distance + limit['distance'];
            distancesArray.push(distance);
        }
     });
     console.log(distancesArray);
    return distancesArray;
}

function getY(beginY, endY, endX, X) {
    var a, b, Y;
    b = beginY;
    a = (endY - beginY) / endX;
    Y = a * X + b;
    return Y;
}

function getFromDistanceInSegment(distanceInSegment, segmentIndex, property_name) {
    var beginProperty = sequenceAfterText[segmentIndex][property_name];
    var endProperty = sequenceAfterText[segmentIndex+1][property_name];
    var length = sequenceAfterText[segmentIndex+1]['distance'];
    var property = getY(beginProperty, endProperty, length, distanceInSegment);
    return property;
}

function updateBackgroundInHome(currentSectionWithId) {
    /* VINCKY */
    /* TO DO factorize with the other sections for instance by changing getDistanceArray*/

    var currentBackground = document.querySelector(`img.background.${currentSectionWithId.id}`);
    var currentSection = document.getElementById(currentSectionWithId.id);

    var homeAfterTextLength =  600; // can be changed
    var switchingLength = homeAfterTextLength/2;
    var scrollTextLength = currentSection.clientHeight - homeAfterTextLength;

    if (currentSectionWithId.distance < scrollTextLength)  {
        // scale of 1 at distance 0
        // scaleMax at home section height
        //
        b = 1
        a = (scaleMax - 1) / (scrollTextLength)
        scale = a * currentSectionWithId.distance + b
        currentBackground.style.transform = 'scale(' + scale + ')';
        currentBackground.style.opacity = 1;
        currentBackground.style.filter = `blur(0)`;
    } else {
        var distanceAfterText = currentSectionWithId.distance - scrollTextLength;
        if (distanceAfterText < switchingLength) {
            console.log("Switching")
            var nextBackground = currentBackground.nextElementSibling;
            currentBackground.style.transform = `scale(${scaleMax})`;
            nextBackground.style.transform = `scale(${scaleMax})`;
            currentBackground.style.filter = `blur(0)`;
            nextBackground.style.filter = `blur(0)`;

            opacity = distanceAfterText  / switchingLength;
            currentBackground.style.opacity = 1 - opacity;
            nextBackground.style.opacity = opacity;
        } else {
            console.log("Blurring")
            currentBackground = currentBackground.nextElementSibling;
            var blur = (distanceAfterText - switchingLength) / (homeAfterTextLength - switchingLength) * blurMax;
            currentBackground.style.filter = `blur(${blur}px)`;
        }
    }
}


function updateBackground(currentSectionWithId) {
    /* VINCKY */

    var currentBackground = document.querySelector(`img.background.${currentSectionWithId.id}`);
    var otherBackgrounds = document.querySelectorAll(`img.background:not(.${currentSectionWithId.id})`);
    var currentSection = document.getElementById(currentSectionWithId.id);

    if (currentSectionWithId.sectionIndex == 0) {
        updateBackgroundInHome(currentSectionWithId);
    } else {
        var distancesArray = getDistancesArray();
        var currentSection = document.getElementById(currentSectionWithId.id);
        var scrollTextLength = currentSection.clientHeight - afterTextLength;
        if (currentSectionWithId.distance < scrollTextLength){
            console.log('We are in textScroll');
            otherBackgrounds.forEach((background) => background.style.opacity = 0);
            currentBackground.style.opacity = 1;
            currentBackground.style.filter = `blur(${blurMax}px)`;
            currentBackground.style.transform = `scale(${scaleMax})`;
        } else {
            console.log('We are after textScroll');
            var distanceAfterText = currentSectionWithId.distance - scrollTextLength;
            for (i = 0; i < distancesArray.length; i++) {
                if (distanceAfterText < distancesArray[i]) {
                    var segment = sequenceAfterText[i+1];
                    var distanceInSegment = i==0 ? distanceAfterText : distanceAfterText - distancesArray[i-1];

                    console.log(`We re  in segment ${i} which corresponds to segment ${segment.name} `);
                    console.log(`And the distance in segment is ${distanceInSegment}`);

                    var blur = getFromDistanceInSegment(distanceInSegment, i, 'blur');
                    var scale = getFromDistanceInSegment(distanceInSegment, i, 'scale');

                    // During switching
                    if (segment.name == 'switching') {
                        var opacity = distanceInSegment / segment.distance;
                        currentBackground.style.opacity = 1 - opacity;
                        currentBackground.nextElementSibling.style.opacity = opacity;
                        currentBackground.nextElementSibling.style.filter = `blur(0)`;
                        currentBackground.nextElementSibling.style.transform = `scale(${scaleMax})`;
                    }
                    // After switching we change currentBacgkround
                    if(segment.name == 'blurring') {currentBackground = currentBackground.nextElementSibling}

                    currentBackground.style.filter = `blur(${blur}px)`;
                    currentBackground.style.transform = `scale(${scale})`;
                    break
                }
            }
        }
    }
}

function adaptBackgroundsToWindow() {
    backgrounds.forEach((background) => adaptBackgroundSize(background));
}


function adaptBackgroundSize(background) {
    console.log('Height  is ' + background.height);
    console.log('Width  is ' + background.width);
    var imgScale =  background.height / background.width;
    var windowScale =  window.innerHeight / window.innerWidth;

    if (windowScale > imgScale) {
        console.log("Height")
        background.height = window.innerHeight;
        background.width = background.height / imgScale;
        var left = (window.innerWidth - background.width) / 2;
        background.style.left = `${left}px`;
    } else {
        console.log("Width")
        background.width =  window.innerWidth;
        background.height = imgScale * background.width;
        var top = (window.innerHeight - background.height) / 2;
        background.style.top = `${top}px`;
    }
}

function adaptBackgroundCenter(background) {
    console.log('Height  is ' + background.height);
    console.log('Width  is ' + background.width);
    var imgScale =  background.height / background.width;
    var windowScale =  window.innerHeight / window.innerWidth;

    if (windowScale > imgScale) {
        console.log("Height")
    } else {
        console.log("Width")
        background.width =  window.innerWidth;
        background.height = imgScale * background.width;
    }
}

function updateOnScroll() {
    var currentSectionWithId = getCurrentSectionWithId();
    updateBackground(currentSectionWithId);
    updateState(currentSectionWithId);
}

function updateLanguage(lang) {
    languages.forEach((language) => {
        if (lang === language.id) {
            language.classList.add('selected');
        } else {
            language.classList.remove('selected');
        }
    });
    document.firstElementChild.setAttribute('lang', lang);
}

var backgrounds, sections, languages;

function init() {
    var defaultLanguage = document.firstElementChild.getAttribute('lang');
    languages = document.querySelectorAll('header .language span');
    languages.forEach((language) => {
        language.addEventListener('click', (event) => updateLanguage(event.target.id))
    });
    updateLanguage(defaultLanguage);

    backgrounds = document.querySelectorAll(`img.background`);
    sections = document.querySelectorAll(`#content section`);
    var currentSectionWithId = getCurrentSectionWithId();
    updateBackground(currentSectionWithId);
    adaptBackgroundsToWindow();

    var content = document.getElementById("content");
    content.addEventListener('scroll', updateOnScroll, { passive: true });
    content.addEventListener('resize', updateOnScroll, { passive: true });

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
