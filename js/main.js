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

    var paddingBottom = window.innerHeight; // can be changed
    var scrollTextLength = currentSection.clientHeight - paddingBottom;
    var fadeInLength = scrollTextLength / 2;
    var zoomInAndOutDistance = paddingBottom / 4;


    /* Here is the sequence 
    * A section has a padding top of one hundred and
    * When we start the beginning of a section the background starts appearing at a scale max
    * and the previous one starts disappearing
    * When we reach the end of the section - paddingBottom
    * The zoom in zoom out occurs in the padding bottom
    */

    var scale = 1;
    var opacity = 1;
    var scaleMax = 6;
    var a, b;
    if (currentSectionWithId.sectionIndex == 0) {
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
        var previousBackground = currentBackground.previousElementSibling;
        if (currentSectionWithId.distance < scrollTextLength) {
            /* We don't scale in the section and the scale stays at scaleMax */
            scale = scaleMax
            backgrounds.forEach((background) => background.style.transform = `scale(${scale})`);
            otherBackgrounds.forEach((background) => {
                if (background !== previousBackground) {
                    background.style.opacity = 0
                }
            });

            if (currentSectionWithId.distance > fadeInLength) {
                /* We fadeIn the backgroundToPutOnTop so by the end of currentSection its opacity is one
                * One the contrary we fade out the background currentlyOnTop
                */
                opacity = (currentSectionWithId.distance - fadeInLength) / fadeInLength;
                currentBackground.style.opacity = opacity;
                previousBackground.style.opacity = 1 - opacity;
            }
        } else {
            currentBackground.style.opacity = 1;
            previousBackground.style.opacity = 0;

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
