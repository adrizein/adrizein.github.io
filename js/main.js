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

var sections, languages, navigation, steps, transitioning = false, loaded = false;


let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

function switchSection(isScrollingDown) {
    const content = document.getElementById("content");
    const currentSection = sections.find((section) => section.classList.contains('active'));
    var isBottom = (content.scrollHeight - content.scrollTop - content.clientHeight < 1)
    var isTop = content.scrollTop == 0;
    if (isScrollingDown && isBottom) {
        const nextSection = currentSection.nextElementSibling;
        if (nextSection && !transitioning) {
            goToSection(nextSection.id);
        }
    }
    if (!isScrollingDown && isTop) {
        const previousSection = currentSection.previousElementSibling;
        if (previousSection && !transitioning) {
            goToSection(previousSection.id);
        }
    }
}

function switchSectionOnSwipe(){
    const gestureZone = document.getElementById('content');
    
    let touchstartY, touchendY, touchstart, touchend;
    gestureZone.addEventListener('touchstart', function(event) {
        touchstartY = event.changedTouches[0].screenY;
        touchstart = event.timeStamp;
    }, false);

    gestureZone.addEventListener('touchend', function(event) {
        touchendY = event.changedTouches[0].screenY;
        touchend = event.timeStamp;
        const velocity = Math.abs(touchendY - touchstartY) / (touchend - touchstart);
        console.log({velocity});
        if (velocity > 1) {
            switchSection(touchendY < touchstartY);
            touchstartY = 0;
            touchendY = 0;
        }
    }, false); 
}

function switchSectionOnMouseWheel(){
    let deltaY = 0;
    document.addEventListener('mousewheel', function (event) {
        deltaY += event.wheelDeltaY;
        if (Math.abs(deltaY) > 300) {
            switchSection(deltaY < 0);
            deltaY = 0;
        }
        else {
            setTimeout(() => {
                if (deltaY) {
                    deltaY -= event.wheelDeltaY;
                }
            }, 200);
        }
    }, false);
}

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

    navigation.forEach((button) => {
        const sectionIndex = parseInt(button.getAttribute('data-nav'));
        const sectionId = sections[sectionIndex].id;
        button.addEventListener('click', function () {
            goToSection(sectionId);
        });
    });

    const hash = location.hash.slice(1) || 'home';
    goToSection(hash);

    const accordions = Array.from(document.getElementsByClassName('accordion-item'));
    accordions.forEach((node) => {
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
    });

    steps.forEach((step) => {
        const answers = Array.from(step.querySelectorAll('.answer'))
        answers.forEach((answer) => answer.addEventListener('click', stepAnswerHandler(step)));
    })

    switchSectionOnMouseWheel();
    switchSectionOnSwipe();
}


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
    return Promise.resolve().then(() => {
        if (!transitioning) {
            transitioning = true;
            window.location.hash = `#${sectionId}`;
            const currentSection = sections.find((section) => section.classList.contains('active'));
            const currentButton = navigation.find((nav) => nav.classList.contains('active'));
            const targetSection = sections.find((section) => section.id === sectionId);
            const targetButton = navigation.find((nav) => nav.classList.contains(sectionId));
            if (currentSection === targetSection) return;
            if (currentSection) currentSection.classList.remove('visible');
            if (currentButton) currentButton.classList.remove('active');
            targetButton.classList.add('active');
            return unblur(1000)
                .then(() => {
                    if (!loaded) return targetSection.classList.add('active');
                    if (currentSection) currentSection.classList.remove('active');
                    const index = sections.findIndex((section) => section.id === sectionId);
                    return slideTo(index);
                })
                .then(() => {
                    if (sectionId === 'home') return;

                    return new Promise((resolve) => {
                        function nextThen() {
                            document.removeEventListener('click', nextThen);
                            document.removeEventListener('mousewheel', nextThen);
                            return resolve();
                        }
                        setTimeout(nextThen, 2000);
                        document.addEventListener('click', nextThen);
                        document.addEventListener('mousewheel', nextThen);
                    });
                })
                .then(() => {
                    if (currentSection) {
                        targetSection.classList.add('active');
                    }
                    requestAnimationFrame(() => {
                        targetSection.classList.add('visible');
                    });
                    if (sectionId === 'home') return;
                    return blur(1000, 20);
                });
        }
    }).then(() => {
        transitioning = false;
        loaded = true;
    });
}

function blur(duration, target) {
    let start;
    return new Promise((resolve) => {
        function blurProgress(current) {
            if (!start) {
                start = current;
                return requestAnimationFrame(blurProgress);
            }

            const progress = (current - start) / duration;
            if (progress < 1) {
                setBlur(progress * target);
                return requestAnimationFrame(blurProgress);
            } else {
                setBlur(target);
                return resolve();
            }
        }
        requestAnimationFrame(blurProgress);
    })
}

function unblur(duration) {
    const initialBlur = getBlur();
    if (initialBlur < 0.001) {
        return Promise.resolve(setBlur(0));
    }
    let start;
    return new Promise((resolve) => {
        function unblurProgress(current) {
            if (!start) {
                start = current;
                return requestAnimationFrame(unblurProgress);
            }

            const progress = (current - start) / duration;
            if (progress < 1) {
                setBlur((1 - progress) * initialBlur);
                return requestAnimationFrame(unblurProgress);
            } else {
                setBlur(0);
                return resolve();
            }
        }
        requestAnimationFrame(unblurProgress);
    })
}

window.onload = init;

const images = [
    "assets/1-home.jpg",
    "assets/2-ethos.jpg",
    "assets/3-infos.jpg",
    "assets/4-contributions.jpg",
    "assets/5-souvenirs.jpg",
];

// content setup
const titles = [
    {
        title: {
            text: "Coucool",
            desktop: {
                anchor: 0.5,
                rx: 0.5,
                ry: 0.48,
                size: 0.22
            },
            mobile: {
                anchor: 0.5,
                rx: 0.5,
                ry: 0.5,
                size: 0.16,
            },
        },
        subtitle: "14.09.20 - 16.08.20",
    },
    {
        title: {
            text: "Ethos",
            pivot: { x: 0.5, y: 0.5 },
            desktop: {
                anchor: 0.5,
                size: 0.22,
                maxSize: 200,
                angle: -90,
                rx: 0.09,
                ry: 0.5,
            },
            mobile: {
                anchor: {x: 0.5, y: 0},
                size: 0.22,
                maxSize: 150,
                angle: 0,
                rx: 0.5,
                ry: 0,
            },
        },
    },
    {
        title: {
            text: "Infos",
            desktop: {
                anchor: 0.5,
                size: 0.20,
                maxSize: 200,
                angle: -90,
                rx: 0.09,
                ry: 0.5,
                pivot: { x: 0.5, y: 0.5 },
            },
            mobile: {
                anchor: {x: 0.5, y: 0},
                size: 0.22,
                maxSize: 150,
                angle: 0,
                rx: 0.5,
                y: 0.1,
                pivot: { x: 0.5, y: 0.5 }
            },
        },
    },
    {
        title: {
            text: "Sesame",
            desktop: {
                anchor: 0.5,
                size: 0.18,
                maxSize: 200,
                angle: -90,
                rx: 0.09,
                ry: 0.5,
                pivot: { x: 0.5, y: 0.5 },
            },
            mobile: {
                anchor: {x: 0.5, y: 0},
                size: 0.18,
                angle: 0,
                rx: 0.5,
                y: 0.08,
                pivot: { x: 0.5, y: 0.5 }
            },
        },
    },
    {
        title: {
            text: "Souvenirs",
            desktop: {
                anchor: 0.5,
                size: 0.15,
                maxSize: 200,
                angle: -90,
                rx: 0.09,
                ry: 0.5,
                pivot: { x: 0.5, y: 0.5 },
            },
            mobile: {
                anchor: {x: 0.5, y: 0},
                size: 0.15,
                angle: 0,
                rx: 0.5,
                y: 0.1,
                pivot: {x: 0.5, y: 0.5}
            },
        },
    },
];

rgbKineticSlider = new rgbKineticSlider({

    slideImages: images,
    itemsTitles: titles,

    backgroundDisplacementSprite: 'assets/map-9.jpg', // slide displacement image
    cursorDisplacementSprite: 'assets/displace-circle.png', // cursor displacement image

    cursorImgEffect: true, // enable cursor effect
    cursorTextEffect: true, // enable cursor text effect
    cursorScaleIntensity: 0.83, // cursor effect intensity
    cursorMomentum: 0.14, // lower is slower

    swipe: false, // enable swipe
    swipeDistance: window.innerWidth * 0.4, // swipe distance - ex : 580
    swipeScaleIntensity: 2, // scale intensity during swipping

    slideTransitionDuration: 1.5, // transition duration
    transitionScaleIntensity: 20, // scale intensity during transition
    transitionScaleAmplitude: 160, // scale amplitude during transition

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
    textTitleSize: 200, // title size
    mobileTextTitleSize: 150, // title size
    textTitleLetterspacing: 3, // title letterspacing
});