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
    document.documentElement.setAttribute('lang', lang);
    if (window.resizeCanvas) window.resizeCanvas();
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
            if (location.hash === '#orga' || location.hash === '#contributions') {
                switchSection(deltaY > 0);
            }
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

function addWeezevent() {
    var script = document.createElement("script");  // create a script DOM node
    script.src = "https://widget.weezevent.com/weez.js";  // set its src to the provided URL
    document.body.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
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

    addAudioPlayer();
    addWeezevent();

    switchSectionOnMouseWheel();
    switchSectionOnSwipe();
}


function stepAnswerHandler(step) {
    return function () {
        const answer = this.getAttribute('data-answer');
        if (answer === 'next') {
            goToNextStep(step);
        }
        else if (answer === 'nextWithDelay') {
            setTimeout(function() {
                goToNextStep(step)
            }, 2000);
        }
        else if (answer) {
            goToSection(answer);
        }
    }
}

function switchPayment() {
    addTreats('oneAndThree');
    document.documentElement.classList.toggle("three-times-payment-active");
}

function setThreeTimesPayment() {
    addTreats('three');
    document.documentElement.classList.add("three-times-payment-active");
}

var currentSample = 0;

function addAudioPlayer() {
    var audioList = [
        "Message en tchèque - Je pense que c_est du russe.mp3",
        "DATA035 - Le philosophe et ses pouces de lentilles.mp3",
        "DATA056 - la première histoire de Coucool.mp3",
        "DATA058 - 2 galaxies.mp3",
        "DATA059 - Je travaille pour Leave No Trace.mp3",
        "DATA060 - La Coucool qui roucoule.mp3",
        "DATA065 - Vendredi j_ai rencontré quelqu_un.mp3",
        "DATA067 - C_est un peu la merde mais c_est quand même beau.mp3",
        "DATA073 - Babi _ Baba.mp3",
        "DATA074 - C_est beau les babos.mp3",
        "DATA087 - Attention il y a de l_amour dans l_air.mp3",
        "DATA088 - Je t_aime petit chat.mp3",
        "DATA094 - Je crois juste que c_est une personne merveilleuse.mp3",
        "DATA096 - Un jour je suis tombé fou amoureux d_une meuf.mp3",
        "DATA099 - Je rencontre des gens par milliers.mp3",
        "DATA100 - En galère totale avec sa tente.mp3",
        "DATA102 - Si personne joue le jeu c_est pas drôle.mp3",
        "DATA104 - Une rencontre, des rencontres.mp3",
        "DATA107 - L_image d_une grande fête.mp3",
        "DATA108 - Une idylle avec quelqu_un de mon entourage.mp3",
        "DATA109 - Une rencontre dans une montagne.mp3",
        "DATA110 - Elle m_a totalement séduite quand elle m_a accompagné faire caca.mp3",
        "DATA113 - La rencontre de ma soeur.mp3",
        "DATA117 - Le bruit des pas de la personne.mp3",
        "DATA118 - Ne fais rien, juste kiff.mp3",
        "DATA120 - C_est un kétosaure.mp3",
        "DATA126 - Rejoins moi avec un maillot de bain.mp3",
        "DATA127 - Un jour on se retrouvera dans une partouze.mp3",
        "DATA132 - Je me suis rencontrée moi-même.mp3",
        "DATA138 - Est-ce que on m_entend.mp3",
        "DATA139 - On va l_appeler J.mp3"
    ];
    audioList.sort(function(a, b) {return 0.5 - Math.random()});
    const samples = document.getElementById("samples");
    samples.src = "./media/" + audioList[currentSample]
    samples.addEventListener("ended", function() {
        currentSample++;
        if (currentSample == audioList.length - 1) {currentSample = 0}
        samples.src = "./media/" + audioList[currentSample];
        samples.play();
    });
    console.log("Shuffled sources");
}


function toggleAudio() {
    const x = document.getElementById("samples");
    const audioButtons = Array.from(document.getElementsByClassName('audioButton'));
    audioButtons.forEach((audioButton) => {
        audioButton.classList.toggle("paused");
        if(audioButton.classList.contains("paused")) {
            x.play();
        } else {
            x.pause();
        }
    });
}

function playSample() {
    x.play();
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
            window.location.hash = `#${sectionId}`;
            if (sectionId === 'orga') {
                sectionId = 'contributions';
                steps.forEach((step) => step.classList.add('orga'));
            } else {
                steps.forEach((step) => step.classList.remove('orga'));
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
                        content.scrollTop = window.innerHeight * 0.25;
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
const y = 14;
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
        subtitle: {fr: "14, 15 & 16 août 2020", en: "14, 15 & 16 august 2020"},
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
                y,
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
                y,
            },
        },
    },
    {
        title: {
            text: {fr: "Sésame", en: "Sesame"},
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
                y,
            },
        },
    },
    {
        title: {
            text: {fr: "Souvenirs", en: "Memories"},
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
                y,
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
    fonts: ['trash:600'], // select google font to use
    buttonMode: false, // enable button mode for title
    textsRgbEffect: true, // enable text rgb effect
    textsRgbIntensity: 0.03, // set text rgb intensity
    navTextsRgbIntensity: 15, // set text rgb intensity for regular nav

    textTitleColor: '#E6E0D5', // title color
    textTitleSize: 200, // title size
    mobileTextTitleSize: 150, // title size
    textTitleLetterspacing: 3, // title letterspacing
});

let width = window.innerWidth;
let height = window.innerHeight;
const body = document.body;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const treatmojis = ["🍬", "🍫", "🍭", "🍡", "🍩", "🍪", "🍒"];
const treats = [];
const radius = 15;

const Cd = 0.47; // Dimensionless
const rho = 1.22; // kg / m^3
const A = Math.PI * radius * radius / 10000; // m^2
const ag = 9.81; // m / s^2
const frameRate = 1 / 60;

function createTreat(elWrapper) /* create a treat */ {
  const vx = getRandomArbitrary(-10, 10); // x velocity
    const vy = getRandomArbitrary(-10, 1);  // y velocity
  
  
  const el = document.createElement("div");
  el.className = "treat";

  const inner = document.createElement("span");
  inner.className = "inner";
  inner.innerText = treatmojis[getRandomInt(0, treatmojis.length - 1)];
  el.appendChild(inner);
  
  elWrapper.appendChild(el);

  const rect = el.getBoundingClientRect();

  const lifetime = getRandomArbitrary(2000, 3000);

  el.style.setProperty("--lifetime", lifetime);

  const treat = {
    el,
    absolutePosition: { x: rect.left, y: rect.top },
    position: { x: rect.left, y: rect.top },
    velocity: { x: vx, y: vy },
    mass: 0.1, //kg
    radius: 0,//el.offsetWidth, // 1px = 1cm
    restitution: -.7,
    
    lifetime,
    direction: vx > 0 ? 1 : -1,

    animating: true,

    remove() {
      this.animating = false;
      this.el.parentNode.removeChild(this.el);
    },

    animate() {
      const treat = this;
      let Fx =
        -0.5 *
        Cd *
        A *
        rho *
        treat.velocity.x *
        treat.velocity.x *
        treat.velocity.x /
        Math.abs(treat.velocity.x);
      let Fy =
        -0.5 *
        Cd *
        A *
        rho *
        treat.velocity.y *
        treat.velocity.y *
        treat.velocity.y /
        Math.abs(treat.velocity.y);

      Fx = isNaN(Fx) ? 0 : Fx;
      Fy = isNaN(Fy) ? 0 : Fy;

      // Calculate acceleration ( F = ma )
      var ax = Fx / treat.mass;
      var ay = ag + Fy / treat.mass;
      // Integrate to get velocity
      treat.velocity.x += ax * frameRate;
      treat.velocity.y += ay * frameRate;

      // Integrate to get position
      treat.position.x += treat.velocity.x * frameRate * 100;
      treat.position.y += treat.velocity.y * frameRate * 100;
      
      treat.checkBounds();
      treat.update();
    },
    
    checkBounds() {

      if (treat.position.y > height - treat.radius) {
        treat.velocity.y *= treat.restitution;
        treat.position.y = height - treat.radius;
      }
      if (treat.position.x > width - treat.radius) {
        treat.velocity.x *= treat.restitution;
        treat.position.x = width - treat.radius;
        treat.direction = -1;
      }
      if (treat.position.x < treat.radius) {
        treat.velocity.x *= treat.restitution;
        treat.position.x = treat.radius;
        treat.direction = 1;
      }

    },

    update() {
      const relX = this.position.x - this.absolutePosition.x;
      const relY = this.position.y - this.absolutePosition.y;

      this.el.style.setProperty("--x", relX);
      this.el.style.setProperty("--y", relY);
      this.el.style.setProperty("--direction", this.direction);
    }
  };

  setTimeout(() => {
    treat.remove();
  }, lifetime);

  return treat;
}


function animationLoop() {
  var i = treats.length;
  while (i--) {
    treats[i].animate();

    if (!treats[i].animating) {
      treats.splice(i, 1);
    }
  }

  requestAnimationFrame(animationLoop);
}

animationLoop();

function addTreats(wrapperId) {
    var elWrapper = document.querySelector("#"+wrapperId);
  //cancelAnimationFrame(frame);
  if (treats.length > 40) {
    return;
  }
  for (let i = 0; i < 10; i++) {
    treats.push(createTreat(elWrapper));
  }
}

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
});
