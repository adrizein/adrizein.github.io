function goTo(url) {
    window.open(url, '_blank');
}

function updateLanguage(lang) {
    languages.forEach((language) => {
        if (lang === language.getAttribute('data-lang')) {
            language.classList.add('selected');
        } else {
            language.classList.remove('selected');
        }
    });
    document.firstElementChild.setAttribute('lang', lang);
}

var sections, languages, navigation, steps, transitioning = false;

function init() {
    var defaultLanguage = document.firstElementChild.getAttribute('lang');
    languages = document.querySelectorAll('.language .button');
    languages.forEach(function (language) {
        language.addEventListener(
            'click',
            function (event) { updateLanguage(event.target.getAttribute('data-lang')); }
        );
    });
    updateLanguage(defaultLanguage);

    sections = Array.from(document.querySelectorAll('#content section'));
    navigation = Array.from(document.querySelectorAll('#menu .main-nav'));
    steps = Array.from(document.querySelectorAll('#contributions .step'));

    for (const button of navigation) {
        const sectionIndex = parseInt(button.getAttribute('data-nav'));
        const sectionId = sections[sectionIndex].id;
        button.addEventListener('click', function () {
            goToSection(sectionId);
        });
    }

    const hash = location.hash.slice(1) || 'home';
    goToSection(hash);

    const accordions = document.getElementsByClassName('accordion-item');
    for (const node of accordions) {
        node.addEventListener('click', function () {
            for (const otherNode of accordions) {
                if (otherNode.classList.contains('active')) {
                    otherNode.classList.remove('active');
                }
                else if (otherNode === node) {
                    node.classList.add('active');
                }
            }
        });
    }

    for (const step of steps) {
        for (const answer of step.querySelectorAll('.answer')) {
            answer.addEventListener('click', stepAnswerHandler(step));
        }
    }

    /*
    $(function() {
        $('#content').swipe({
            swipeUp() {
                const currentSection = getCurrentSectionWithId();
                const nextSection = getSectionFromSectionIndex(currentSection.sectionIndex + 1);
                if (nextSection) {
                    goToSection(nextSection.id);
                }
            },
            swipeDown() {
                const currentSection = getCurrentSectionWithId();
                const previousSection = getSectionFromSectionIndex(currentSection.sectionIndex - 1);
                if (previousSection) {
                    goToSection(previousSection.id);
                }
            }
        });
    });
    */
}

/*
window.addEventListener('scroll', function(e) {
    console.log(e.target);
    console.log(e.target.scrollHeight);
    console.log(e.target.scrollTop);
    console.log(e.target.clientHeight);
}, true);
*/


document.addEventListener('mousewheel',function(event){
    console.log("inMouseWheel");
    const content = document.getElementById("content");
    const presentSection = sections.find((section) => section.classList.contains('active'));
    
    var isBottom = (content.scrollHeight - content.scrollTop - content.clientHeight < 1)
    var isTop = content.scrollTop == 0;	
	var isScrollingDown = event.wheelDeltaY < -100;
    var isScrollingUp = event.wheelDeltaY > 100;

	if( isScrollingDown && isBottom) {
        const nextSection = presentSection.nextElementSibling;
        if (nextSection) {
            goToSection(nextSection.id);
            slideNext()
        }
    }
	if( isScrollingUp && isTop) {
        const previousSection = presentSection.previousElementSibling;
        if (previousSection) {
            goToSection(previousSection.id);
            slidePrevious();
        }
    }
	
}, false);

function stepAnswerHandler(step) {
    return function () {
        const answer = this.getAttribute('data-answer');
        if (answer === 'next') {
            goToNextStep(step);
        }
        else if (answer) {
            goToSection(answer);
        }
    }
}

/**
 * 
 * @param {HTMLElement} step 
 */
function goToNextStep(step) {
    step.classList.remove('visible');
    const nextStep = step.nextElementSibling;
    setTimeout(() => {
        step.classList.remove('active');
        nextStep.classList.add('active');
        if (nextStep.classList.contains('weezevent')) {
        }
        requestAnimationFrame(() => nextStep.classList.add('visible'));
    }, 500);
}

function goToSection(sectionId) {
    if (!transitioning) {
        transitioning = true;
        setTimeout(() => transitioning = false, 2000);
        window.location.hash = `#${sectionId}`;
        const canvas = document.getElementById('rgbKineticSlider');
        canvas.classList.remove('blur');
        const currentSection = sections.find((section) => section.classList.contains('active'));
        const currentButton = navigation.find((nav) => nav.classList.contains('active'));
        const targetSection = sections.find((section) => section.id === sectionId);
        const targetButton = navigation.find((nav) => nav.classList.contains(sectionId));
        if (currentSection === targetSection) {
            return;
        }
        if (currentSection) currentSection.classList.remove('visible');
        if (currentButton) currentButton.classList.remove('active');
        targetButton.classList.add('active');
        if (!currentSection) targetSection.classList.add('active');
        setTimeout(() => {
            if (currentSection) {
                currentSection.classList.remove('active');
                targetSection.classList.add('active');
            }
            if (sectionId !== 'home') {
                canvas.classList.add('blur');
            }
            requestAnimationFrame(() => {
                targetSection.classList.add('visible');
            });
        }, 1000);
    }
}

window.onload = init;

const images = [
    "/assets/1-home.jpg",
    "/assets/2-ethos.jpg",
    "/assets/3-infos.jpg",
    "/assets/4-contributions.jpg",
    "/assets/5-curiosites.jpg",
];

// content setup
const titles = [
    {text: "Coucool", anchor: 0.5, x: 0.5, y: 0.5},
].concat(["Ethos", "Infos", "Sesame", "Contributions", "Curiosités"].map((text) => ({text, anchor: 0.5, angle: -90, x: 0.1, y: 0.5, pivot: {x: 0.5, y: 0.5}})));

rgbKineticSlider = new rgbKineticSlider({

    slideImages: images,
    itemsTitles: titles,

    backgroundDisplacementSprite: 'http://hmongouachon.com/_demos/rgbKineticSlider/map-9.jpg', // slide displacement image 
    cursorDisplacementSprite: 'http://hmongouachon.com/_demos/rgbKineticSlider/displace-circle.png', // cursor displacement image

    cursorImgEffect: true, // enable cursor effect
    cursorTextEffect: true, // enable cursor text effect
    cursorScaleIntensity: 0.65, // cursor effect intensity
    cursorMomentum: 0.14, // lower is slower

    swipe: true, // enable swipe
    swipeDistance: window.innerWidth * 0.4, // swipe distance - ex : 580
    swipeScaleIntensity: 2, // scale intensity during swipping

    slideTransitionDuration: 1, // transition duration
    transitionScaleIntensity: 30, // scale intensity during transition
    transitionScaleAmplitude: 160, // scale amplitude during transition

    nav: true, // enable navigation
    navElement: '.main-nav', // set nav class

    imagesRgbEffect: true, // enable img rgb effect
    imagesRgbIntensity: 0.9, // set img rgb intensity
    navImagesRgbIntensity: 80, // set img rgb intensity for regular nav 

    textsDisplay: true, // show title
    textsTiltEffect: true, // enable text tilt
    fonts: ['trash:700'], // select google font to use
    buttonMode: false, // enable button mode for title
    textsRgbEffect: true, // enable text rgb effect
    textsRgbIntensity: 0.03, // set text rgb intensity
    navTextsRgbIntensity: 15, // set text rgb intensity for regular nav

    textTitleColor: 'white', // title color
    textTitleSize: 150, // title size
    mobileTextTitleSize: 150, // title size
    textTitleLetterspacing: 3, // title letterspacing
});