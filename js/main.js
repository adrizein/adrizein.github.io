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

var sections, languages, navigation, steps, transitioning = false, loaded = false, content;
const targetSections = {
    current: null,
    next: null,
};

function switchSection(isScrollingDown, bypass) {
    if (transitioning) return;
    const content = document.getElementById("content");
    const currentSection = sections.find((section) => section.classList.contains('active'));
    var isBottom = (content.scrollHeight - content.scrollTop - content.clientHeight < 1);
    var isTop = content.scrollTop === 0;
    if (isScrollingDown && (bypass || isBottom)) {
        const nextSection = currentSection.nextElementSibling;
        if (nextSection) {
            goToSection(nextSection.id);
        }
    }
    if (!isScrollingDown && (bypass || isTop)) {
        const previousSection = currentSection.previousElementSibling;
        if (previousSection) {
            goToSection(previousSection.id);
        }
    }
}

function switchSectionOnSwipe() {
    const gestureZone = document.getElementById('content');
    
    let touchstartX, touchendX, touchstart, touchend;
    gestureZone.addEventListener('touchstart', function(event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstart = event.timeStamp;
    }, false);

    gestureZone.addEventListener('touchend', function(event) {
        touchendX = event.changedTouches[0].screenX;
        touchend = event.timeStamp;
        const velocity = Math.abs(touchendX - touchstartX) / (touchend - touchstart);
        if (velocity > 1) {
            switchSection(touchendX < touchstartX, true);
            touchstartX = 0;
            touchendX = 0;
        }
    }, false); 
}

function switchSectionOnMouseWheel() {
    let deltaY = 0;
    let deltaThreshold;
    document.addEventListener('wheel', function (event) {
        if (deltaThreshold === undefined) {
            deltaThreshold = event.deltaY > 70 ? 300 : 10;
        }
        deltaY += event.deltaY;
        if (Math.abs(deltaY) > deltaThreshold) {
            switchSection(deltaY > 0);
            deltaY = 0;
        }
        else {
            setTimeout(() => deltaY = 0, 200);
        }
    }, false);
}

function toggleMenu() {
    document.documentElement.classList.toggle("menu-opened");
}

function init() {
    var defaultLanguage = navigator.language.split('-')[0];
    languages = document.querySelectorAll('.language .button');
    let languageOk = false;
    languages.forEach((language) => {
        const lang = language.getAttribute('data-lang');
        if (lang === defaultLanguage) {
            languageOk = true;
        }
        language.addEventListener(
            'click',
            () => updateLanguage(lang)
        );
    });
    if (!languageOk) {
        defaultLanguage = 'en';
    }
    updateLanguage(defaultLanguage);
    document.body.classList.add('page-loaded');
    const loader = document.getElementById('loader');
    when('transitionend', loader).then(() => loader.style.display = 'none');

    content = document.getElementById('content');
    sections = Array.from(document.querySelectorAll('#content section'));
    navigation = Array.from(document.querySelectorAll('#menu .main-nav'));
    steps = Array.from(document.querySelectorAll('#contributions .step'));

    navigation.forEach((button) => {
        const sectionIndex = parseInt(button.getAttribute('data-nav'));
        const sectionId = sections[sectionIndex].id;
        button.addEventListener('click', function () {
            if (window.innerWidth < 1100) {
                toggleMenu();
            } else {
                goToSection(sectionId);
            }
        });
    });

    const hash = location.hash.slice(1) || 'home';
    goToSection(hash);

    window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1) || 'home';
        goToSection(hash);
    });

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
        const answers = Array.from(step.querySelectorAll('.answer'));
        answers.forEach((answer) => answer.addEventListener('click', stepAnswerHandler(step)));
    });

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

function switchPayment() {
    document.documentElement.classList.toggle("three-times-payment-active");
}

function setThreeTimesPayment() {
    document.documentElement.classList.add("three-times-payment-active");
}

/**
 *
 * @param {HTMLElement} step
 */
function goToNextStep(step) {
    step.classList.remove('visible');
    const nextStep = step.nextElementSibling;
    if (location.hash === '#orga') {
        nextStep.classList.add('orga');
    } else {
        nextStep.classList.remove('orga');
    }
    return when('transitionend', step).then(() => {
        step.classList.remove('active');
        nextStep.classList.add('active');
        return wait(10);
    }).then(() => {
        nextStep.classList.add('visible');
    });
}

function processSectionTarget() {
    let sectionId = targetSections.current;
    return Promise.resolve()
        .then(() => {
            if (false && targetSections.next !== null) {
                targetSections.current = targetSections.next;
                targetSections.next = null;
                return processSectionTarget();
            }

            window.location.hash = `#${sectionId}`;
            if (sectionId === 'orga') {
                sectionId = 'contributions';
                steps.forEach((step) => step.classList.add('orga'));
            }
            const currentSection = sections.find((section) => section.classList.contains('active'));
            const currentButton = navigation.find((nav) => nav.classList.contains('active'));
            const targetSection = sections.find((section) => section.id === sectionId);
            const targetButton = navigation.find((nav) => nav.classList.contains(sectionId));
            if (currentSection === targetSection) return;
            if (currentSection) currentSection.classList.remove('visible');
            if (currentButton) currentButton.classList.remove('active');
            if (targetButton) targetButton.classList.add('active');

            return Promise.resolve()
                .then(() => {
                    if (false && targetSections.next !== null) {
                        targetSections.current = targetSections.next;
                        targetSections.next = null;
                        return processSectionTarget();
                    }
                    if (currentSection) {
                        return when('transitionend', currentSection);
                    }
                }).then(() => {
                    if (currentSection) currentSection.classList.remove('active');
                    targetSection.classList.add('active');
                    unblur(500);
                    return wait(10);
                }).then(() => {
                    if (!loaded) return;
                    const index = sections.findIndex((section) => section.id === sectionId);
                    return slideTo(index);
                })
                .then(() => {
                    if (sectionId === 'home') return;
                    return Promise.race([
                        wait(2500),
                        when('click', document),
                        when('wheel', document),
                        when('touchstart', document),
                    ]);
                })
               .then(() => {
                    if (targetSection.querySelector('.spacer:first-child')) {
                        // content.scrollTop = window.innerHeight / 10;
                    }
                    targetSection.classList.add('visible');
                    if (sectionId !== 'home') blur(1000, 20);
                })
        }).then(() => {
            transitioning = false;
            loaded = true;
        });
}

function goToSection(sectionId) {
        if (!transitioning) {
            transitioning = true;
            targetSections.current = sectionId;
            processSectionTarget();
        }
        else {
            targetSections.next = sectionId;
        }
}

function closeAndGoToSection(sectionId) {
    toggleMenu();
    setTimeout(() => {  
        goToSection(sectionId);
    }, 1000);
}

function when(eventName, target) {
    if (target) {
        return new Promise((resolve) => {
            function eventListener(event) {
                resolve();
                target.removeEventListener(eventName, eventListener);
            }
            target.addEventListener(eventName, eventListener);
        });
    } else {
        return Promise.resolve();
    }
}

function wait(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
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
            landscape: {
                anchor: 0.5,
                rx: 0.5,
                ry: 0.48,
                rsize: 0.1,
            },
            portrait: {
                anchor: 0.5,
                rx: 0.5,
                ry: 0.48,
                rsize: 0.17,
                maxSize: 100,
            },
        },
        subtitle: "14, 15 & 16 août 2020",
    },
    {
        title: {
            text: "Ethos",
            landscape: {
                vertical: true,
                anchor: 0.5,
                rsize: 0.2,
                maxSize: 200,
                rx: 0.12,
                ry: 0.5,
            },
            portrait: {
                anchor: {x: 0, y: 0},
                size: 50,
                maxSize: 150,
                rx: 0.04,
                ry: 0,
            },
        },
    },
    {
        title: {
            text: "Infos",
            landscape: {
                vertical: true,
                anchor: 0.5,
                rsize: 0.20,
                maxSize: 200,
                rx: 0.12,
                ry: 0.5,
            },
            portrait: {
                anchor: {x: 0, y: 0},
                size: 50,
                maxSize: 150,
                rx: 0.04,
                ry: 0,
            },
        },
    },
    {
        title: {
            text: "Sésame",
            landscape: {
                vertical: true,
                anchor: 0.5,
                rsize: 0.18,
                maxSize: 200,
                rx: 0.12,
                ry: 0.5,
            },
            portrait: {
                anchor: {x: 0, y: 0},
                size: 50,
                rx: 0.04,
                ry: 0,
            },
        },
    },
    {
        title: {
            text: "Souvenirs",
            landscape: {
                anchor: 0.5,
                rsize: 0.15,
                maxSize: 200,
                rx: 0.12,
                ry: 0.5,
                vertical: true,
            },
            portrait: {
                anchor: {x: 0, y: 0},
                size: 50,
                rx: 0.04,
                ry: 0,
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

    textTitleColor: '#E6E0D5', // title color
    textTitleSize: 200, // title size
    mobileTextTitleSize: 150, // title size
    textTitleLetterspacing: 3, // title letterspacing
});