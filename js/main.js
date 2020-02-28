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

var sections, languages;

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

    sections = document.querySelectorAll(`#content section`);

    for (const node of document.getElementsByClassName('accordion-item')) {
        node.addEventListener('click', function () {
            if (node.classList.contains('active')) {
                node.classList.remove('active');
            }
            else {
                node.classList.add('active');
            }
        });
    }

    for (const button of document.querySelectorAll('#menu .button')) {
        const section = button.getAttribute('data-section');
        button.addEventListener('click', function () {
            goToSection(section);
        });
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

function goToSection(sectionId) {
    console.log(window.location.href, sectionId);
    window.location.hash = `#${sectionId}`;
    console.log(window.location)
}

window.onload = init;

const images = [
    "/assets/1-home.jpg",
    "/assets/2-principes.jpg",
    "/assets/3-infos.jpg",
    "/assets/4-contributions.jpg",
    "/assets/5-curiosites.jpg",
];

// content setup
const texts = [
    ["Coucool", ""],
    ["Ethos", ""],
    ["Infos", ""],
    ["Contributions", ""],
    ["Curiosités", ""],
]

rgbKineticSlider = new rgbKineticSlider({

    slideImages: images, // array of images > must be 1920 x 1080
    itemsTitles: texts, // array of titles / subtitles

    backgroundDisplacementSprite: 'http://hmongouachon.com/_demos/rgbKineticSlider/map-9.jpg', // slide displacement image 
    cursorDisplacementSprite: 'http://hmongouachon.com/_demos/rgbKineticSlider/displace-circle.png', // cursor displacement image

    cursorImgEffect: true, // enable cursor effect
    cursorTextEffect: false, // enable cursor text effect
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

    imagesRgbEffect: false, // enable img rgb effect
    imagesRgbIntensity: 0.9, // set img rgb intensity
    navImagesRgbIntensity: 80, // set img rgb intensity for regular nav 

    textsDisplay: true, // show title
    textsSubTitleDisplay: true, // show subtitles
    textsTiltEffect: true, // enable text tilt
    googleFonts: ['Playfair Display:700', 'Roboto:400'], // select google font to use
    buttonMode: false, // enable button mode for title
    textsRgbEffect: true, // enable text rgb effect
    textsRgbIntensity: 0.03, // set text rgb intensity
    navTextsRgbIntensity: 15, // set text rgb intensity for regular nav

    textTitleColor: 'white', // title color
    textTitleSize: 125, // title size
    mobileTextTitleSize: 125, // title size
    textTitleLetterspacing: 3, // title letterspacing

    textSubTitleColor: 'white', // subtitle color ex : 0x000000
    textSubTitleSize: 21, // subtitle size
    mobileTextSubTitleSize: 21, // mobile subtitle size
    textSubTitleLetterspacing: 2, // subtitle letter spacing
    textSubTitleOffsetTop: 90, // subtitle offset top
    mobileTextSubTitleOffsetTop: 90, // mobile subtitle offset top
});