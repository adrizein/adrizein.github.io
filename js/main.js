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


function updateBackground(currentSectionWithId) {
    /* VINCKY */

    /* Where we manage the backgrounds */
    var currentBackground = document.querySelector(`img.background.${currentSectionWithId.id}`);
    var otherBackgrounds = document.querySelectorAll(`img.background:not(.${currentSectionWithId.id})`);
    var currentSection = document.getElementById(currentSectionWithId.id);



    /* Here is the sequence 
    * A section has a padding top of 10px (but we don't care)
    * When we start the beginning of a section the background is 
    *   at a scale max
    *   with a blur Max
    *   with opacity 1
    * it stays this way until the end of the text
    * When we reach the end of the text
    * The zoom in zoom out occurs in the padding bottom
    */

    var scale = 1;
    var opacity = 1;
    var scaleMax = 6;
    var a, b;
    if (currentSectionWithId.sectionIndex == 0) {
        var homePaddingBottom =  window.innerHeight / 2; // can be changed
        var scrollTextLength = currentSection.clientHeight - homePaddingBottom;
        var distanceInPaddingBottom = currentSectionWithId.distance - scrollTextLength;

        console.log(currentSectionWithId.distance)
        console.log("Should be fading in and out in home")
        if (currentSectionWithId.distance < scrollTextLength)  {
            /* scale of 1 at distance 0
            * scaleMax at home section height
            */
            b = 1
            a = (scaleMax - 1) / (currentSection.clientHeight)
            scale = a * currentSectionWithId.distance + b
            currentBackground.style.transform = 'scale(' + scale + ')';
            currentBackground.style.opacity = 1;
            otherBackgrounds.forEach((background) => background.style.opacity = 0);
        } else {
            console.log("Should be fading in and out in home")
            var nextBackground = currentBackground.nextElementSibling;
            backgrounds.forEach((background) => background.style.transform = `scale(${scaleMax})`);
            opacity = distanceInPaddingBottom  / homePaddingBottom;
            currentBackground.style.opacity = 1 - opacity;
            nextBackground.style.opacity = opacity;
        }
    } else {
        var paddingBottom =  2 * window.innerHeight; // can be changed
        var scrollTextLength = currentSection.clientHeight - paddingBottom;
        var zoomInAndOutDistance = paddingBottom / 4;
        var focusDistance = paddingBottom / 4;
        var fadeInAndOutDistance = paddingBottom - 2 * zoomInAndOutDistance -  focusDistance;
        var distanceInPaddingBottom = currentSectionWithId.distance - scrollTextLength;

        if (currentSectionWithId.distance < scrollTextLength) {
            /* We don't scale in the section and the scale stays at scaleMax */
            scale = scaleMax
            backgrounds.forEach((background) => background.style.transform = `scale(${scale})`);
            otherBackgrounds.forEach((background) => background.style.opacity = 0);
            currentBackground.style.opacity = 1;
        } else if (distanceInPaddingBottom < zoomInAndOutDistance) {
            console.log("Should be zooming out")
            scale = scaleMax + (1 - scaleMax) * distanceInPaddingBottom / zoomInAndOutDistance;
            currentBackground.style.transform = `scale(${scale})`;
            currentBackground.style.opacity = 1;
            otherBackgrounds.forEach((background) => background.style.opacity = 0);
        } else if (distanceInPaddingBottom < zoomInAndOutDistance + focusDistance) {
            console.log("Should be focused")
            currentBackground.style.transform = `scale(1)`;
            currentBackground.style.opacity = 1;
            otherBackgrounds.forEach((background) => background.style.opacity = 0);
        } else if (distanceInPaddingBottom < 2* zoomInAndOutDistance + focusDistance) {
            console.log("Should be zooming in")
            // When distanceInPaddingBottom = 2* zoomInAndOutDistance + focusDistance
            // scaleMax = a * (2* zoomInAndOutDistance + focusDistance) + b
            // 1 = a * (zoomInAndOutDistance + focusDistance) + b
            //
            a = (scaleMax - 1) / (zoomInAndOutDistance);
            b = 1 - a * (zoomInAndOutDistance + focusDistance);
            scale = b + a * distanceInPaddingBottom;
            currentBackground.style.transform = `scale(${scale})`;
            currentBackground.style.opacity = 1;
            otherBackgrounds.forEach((background) => background.style.opacity = 0);
        } else {
            console.log("Should be fading in and out")
            var nextBackground = currentBackground.nextElementSibling;
            currentBackground.style.transform = `scale(${scaleMax})`;
            opacity = (distanceInPaddingBottom - (2* zoomInAndOutDistance + focusDistance)) / fadeInAndOutDistance;
            currentBackground.style.opacity = 1 - opacity;
            nextBackground.style.opacity = opacity;
        }
        /*
            // But we zoom out and in in the spacer !
            var distanceInSpacer = currentSectionWithId.distance - scrollTextLength;
            if (distanceInSpacer < zoomInAndOutDistance) {
                // Zoom out 
                //scale =  1 ;
                console.log("Zooming out");
                scale = scaleMax + (1 - scaleMax) * distanceInSpacer / zoomInAndOutDistance;
            } else if (distanceInSpacer > (paddingBottom - zoomInAndOutDistance)) {
                // Zoom in 
                // scale =  scaleMax ;
                // At paddingBottom we want  scaleMax
                // At paddingBottom - zoomInAndOutDistance we want 1
                // 1 = a x (paddingBottom - zoomInAndOutDistance) + b
                // scaleMax = a x paddingBottom + b

                console.log("Zooming in");

                a = (scaleMax - 1) / (zoomInAndOutDistance);
                b = scaleMax - a * paddingBottom;
                scale = b + a * distanceInSpacer;
            } else {
                // We are in the "palier" where the scale is one
                scale = 1;
            }
            currentBackground.style.transform = `scale(${scale})`;
        }
        */
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
