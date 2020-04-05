(function () {

    window.rgbKineticSlider = function (options) {

        ///////////////////////////////    

        //  OPTIONS

        /////////////////////////////// 

        options = options || {};
        options.slideImages = options.hasOwnProperty('slideImages') ? options.slideImages : [];
        options.itemsTitles = options.hasOwnProperty('itemsTitles') ? options.itemsTitles : [];
        options.backgroundDisplacementSprite = options.hasOwnProperty('backgroundDisplacementSprite') ? options.backgroundDisplacementSprite : '';
        options.cursorDisplacementSprite = options.hasOwnProperty('cursorDisplacementSprite') ? options.cursorDisplacementSprite : '';
        options.cursorImgEffect = options.hasOwnProperty('cursorImgEffect') ? options.cursorImgEffect : true;
        options.cursorTextEffect = options.hasOwnProperty('cursorTextEffect') ? options.cursorTextEffect : true;
        options.cursorScaleIntensity = options.hasOwnProperty('cursorScaleIntensity') ? options.cursorScaleIntensity : 0.25;
        options.cursorMomentum = options.hasOwnProperty('cursorMomentum') ? options.cursorMomentum : 0.14;
        options.slideTransitionDuration = options.hasOwnProperty('slideTransitionDuration') ? options.slideTransitionDuration : 1;
        options.transitionScaleIntensity = options.hasOwnProperty('transitionScaleIntensity') ? options.transitionScaleIntensity : 40;
        options.transitionScaleAmplitude = options.hasOwnProperty('transitionScaleAmplitude') ? options.transitionScaleAmplitude : 300;
        options.swipeScaleIntensity = options.hasOwnProperty('swipeScaleIntensity') ? options.swipeScaleIntensity : 0.3;
        options.transitionSpriteRotation = options.hasOwnProperty('transitionSpriteRotation') ? options.transitionSpriteRotation : 0;
        options.textsRgbEffect = options.hasOwnProperty('textsRgbEffect') ? options.textsRgbEffect : true;
        options.imagesRgbEffect = options.hasOwnProperty('imagesRgbEffect') ? options.imagesRgbEffect : false;
        options.textsSubTitleDisplay = options.hasOwnProperty('textsSubTitleDisplay') ? options.textsSubTitleDisplay : false;
        options.textsDisplay = options.hasOwnProperty('textsDisplay') ? options.textsDisplay : false;
        options.textsTiltEffect = options.hasOwnProperty('textsTiltEffect') ? options.textsTiltEffect : true;
        options.fonts = options.hasOwnProperty('fonts') ? options.fonts : ['serif:400'];
        options.buttonMode = options.hasOwnProperty('buttonMode') ? options.buttonMode : true;
        options.textTitleColor = options.hasOwnProperty('textTitleColor') ? options.textTitleColor : 'white';
        options.textTitleSize = options.hasOwnProperty('textTitleSize') ? options.textTitleSize : 125;
        options.mobileTextTitleSize = options.hasOwnProperty('mobileTextTitleSize') ? options.mobileTextTitleSize : 45;
        options.textTitleLetterspacing = options.hasOwnProperty('textTitleLetterspacing') ? options.textTitleLetterspacing : 3;
        options.textSubTitleColor = options.hasOwnProperty('textSubTitleColor') ? options.textSubTitleColor : 'white';
        options.textSubTitleSize = options.hasOwnProperty('textSubTitleSize') ? options.textSubTitleSize : 21;
        options.mobileTextSubTitleSize = options.hasOwnProperty('mobileTextSubTitleSize') ? options.mobileTextSubTitleSize : 14;
        options.textSubTitleLetterspacing = options.hasOwnProperty('textSubTitleLetterspacing') ? options.textSubTitleLetterspacing : 3;
        options.textSubTitleOffsetTop = options.hasOwnProperty('textSubTitleOffsetTop') ? options.textSubTitleOffsetTop : 120;
        options.mobileTextSubTitleOffsetTop = options.hasOwnProperty('mobileTextSubTitleOffsetTop') ? options.mobileTextSubTitleOffsetTop : 40;
        options.textsRgbIntensity = options.hasOwnProperty('textsRgbIntensity') ? options.textsRgbIntensity : 0.09;
        options.navTextsRgbIntensity = options.hasOwnProperty('navTextsRgbIntensity') ? options.navTextsRgbIntensity : 10;
        options.imagesRgbIntensity = options.hasOwnProperty('imagesRgbIntensity') ? options.imagesRgbIntensity : 0.9;
        options.navImagesRgbIntensity = options.hasOwnProperty('navImagesRgbIntensity') ? options.navImagesRgbIntensity : 100;

        ///////////////////////////////
        //  PIXI                     //
        ///////////////////////////////

        const imgWidth = 1920;
        const imgHeight = 1536;
        const imgRatio = imgWidth / imgHeight;

        // remove pixi message in console
        PIXI.utils.skipHello();

        const renderer = new PIXI.autoDetectRenderer(window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio, {
            transparent: true,
            autoResize: false,
            resolution: 1,
            antialias: true,
        });

        function fullBounds() {
            this._bounds.clear();
            this._bounds.addFrame(this.transform, 0, 0, renderer.width, renderer.height);
        }

        const canvas = document.getElementById("rgbKineticSlider");
        const stage = new PIXI.Container();
        const mainContainer = new PIXI.Container();
        const imagesContainer = new PIXI.Container();
        const dateContainer = new PIXI.Container();
        const textsContainer = new PIXI.Container();
        textsContainer._calculateBounds = fullBounds;
        dateContainer._calculateBounds = fullBounds;
        // displacement variables used for slides transition 
        const dispSprite = new PIXI.Sprite.from(options.backgroundDisplacementSprite);
        const dispFilter = new PIXI.filters.DisplacementFilter(dispSprite);

        // displacement variables used for cursor moving effect
        const dispSprite_2 = PIXI.Sprite.from(options.cursorDisplacementSprite);
        const size = Math.max(window.innerHeight, window.innerHeight);
        dispSprite_2.height = devicePixelRatio * size / 1.5;
        dispSprite_2.width = devicePixelRatio * size / 1.5;
        const dispFilter_2 = new PIXI.filters.DisplacementFilter(dispSprite_2);

        // colors filters
        const splitRgb = new PIXI.filters.RGBSplitFilter;
        const splitRgbImgs = new PIXI.filters.RGBSplitFilter;

        const blur = new PIXI.filters.BlurFilter(8, 6);

        // main elements
        let render; // pixi render
        let mainLoopID; // raf

        let slideImages;
        let slideTexts;
        let subtitle;

        // slide index
        let currentIndex = 0;
        // swipping flag
        let is_swipping = false;
        let drag_start = 0;
        // transition flag
        let is_playing = false;
        // moving flag
        let is_moving = false;
        // load flag
        let is_loaded = false;

        // set some variables for mouseposition and moving effect
        let posx = 0,
            posy = 0,
            vx = 0,
            vy = 0,
            kineX = 0,
            kineY = 0;

        // include the web-font loader script dynamically
        (function () {
            let wf = document.createElement('script');
            wf.src = (document.location.protocol === 'https:' ? 'https' : 'http') +
                '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
            wf.type = 'text/javascript';
            wf.async = 'true';
            let s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(wf, s);
        }());

        ///////////////////////////////
        //  Build pixi scene         //
        ///////////////////////////////

        function build_scene() {

            // append render to canvas
            canvas.appendChild(renderer.view);

            // set dispFilter to the stage
            stage.filters = [dispFilter];
            // stage.scale.set(2)

            // enable cursorInteractive on mainContainer
            mainContainer.interactive = true;

            // set rgbSplitFilter to 0
            splitRgb.red = [0, 0];
            splitRgb.green = [0, 0];
            splitRgb.blue = [0, 0];

            textsContainer.filters = [splitRgb];
            dateContainer.filters = [splitRgb];

            // apply rgbsplit effect on imgs
            if ((options.imagesRgbEffect === true) && (options.cursorImgEffect === true)) {

                if (options.cursorImgEffect === true) {
                    imagesContainer.filters = [dispFilter_2, splitRgbImgs, blur];
                } else {
                    imagesContainer.filters = [splitRgbImgs, blur];
                }

                splitRgbImgs.red = [0, 0];
                splitRgbImgs.green = [0, 0];
                splitRgbImgs.blue = [0, 0];
            } else {
                if (options.cursorImgEffect === true) {
                    imagesContainer.filters = [dispFilter_2, blur];
                }
            }

            // Displacement sprites and filters set up
            dispSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
            dispFilter.autoFit = false;
            dispFilter.padding = 0;
            dispSprite_2.anchor.set(0.5);

            blur.blur = 0;

            // renderer settings

            //  Add children to the main container
            mainContainer.addChild(imagesContainer, textsContainer, dateContainer, dispSprite_2);

            // Add children to the stage = canvas
            stage.addChild(mainContainer, dispSprite);

            // pixi render animation
            render = new PIXI.Ticker();
            render.autoStart = true;
            render.add(function (delta) {
                renderer.render(stage);
            });
        }


        ///////////////////////////////
        //  Build pixi img elements  //
        ///////////////////////////////

        function buildImgs() {

            for (let i = 0; i < options.slideImages.length; i++) {

                // get texture from image
                const texture = new PIXI.Texture.from(options.slideImages[i]);
                // set sprite from texture
                const imgSprite = new PIXI.Sprite(texture);

                // center img
                imgSprite.anchor.set(0.5);
                resizeImg(imgSprite);

                // hide all imgs
                TweenMax.set(imgSprite, {
                    alpha: 0
                });

                // add img to the canvas
                imagesContainer.addChild(imgSprite);
            }

            slideImages = imagesContainer.children;
        }

        function resizeImg(imgSprite) {
            const aspectRatio = renderer.width / renderer.height;
            if (aspectRatio > imgRatio) {
                imgSprite.width = renderer.width;
                imgSprite.height = imgHeight * (renderer.width / imgWidth);
            } else {
                imgSprite.height = renderer.height;
                imgSprite.width = imgWidth * (renderer.height / imgHeight);
            }
            imgSprite.x = renderer.width / 2;
            imgSprite.y = renderer.height / 2;
        }

        function resizeImgs() {
            slideImages.forEach(resizeImg);
        }


        ////////////////////////////////
        //  Build pixi texts elements //
        ////////////////////////////////

        function getOrientation() {
            const ratio = window.innerWidth / window.innerHeight;
            if (ratio > imgRatio) {
                return 'landscape';
            } else {
                return 'portrait';
            }
        }

        function getLanguage() {
            return document.documentElement.lang;
        }

        function buildTexts() {
            const orientation = getOrientation();
            const language = getLanguage();

            // make sure array is not empty
            if (options.itemsTitles.length > 0) {
                const fontOptions = options.fonts[0].split(':');
                const fontFamily = fontOptions[0];
                const fontWeight = fontOptions[1];

                for (let i = 0; i < options.itemsTitles.length; i++) {
                    const properties = options.itemsTitles[i];
                    const maybeSubtitle = properties.subtitle;
                    const title = properties.title;
                    const fontStyle = getFontStyle(properties, orientation);
                    const text = title.text[language] || title.text;
                    const textTitle = new PIXI.Text(text, {
                        fontFamily,
                        fontSize: fontStyle.fontSize,
                        fontWeight,
                        fill: 'transparent',
                        stroke: options.textTitleColor,
                        strokeThickness: fontStyle.strokeThickness,
                    });

                    if (maybeSubtitle && !subtitle) {
                        subtitle = maybeSubtitle;
                        dateContainer.addChild(new PIXI.Text(subtitle[language], {
                            fontFamily: 'walsheim',
                            fontSize: fontStyle.fontSize * 0.2,
                            fontWeight: 400,
                            fill: options.textTitleColor,
                        }));
                    }

                    textTitle.pivot.set(0.5, 0.5);
                    resizeText(textTitle, properties, orientation, language);
                    textsContainer.addChild(textTitle);

                    // hide all titles on init
                    TweenMax.set(textTitle, {
                        alpha: 0
                    });
                }

                resizeDate(orientation, language);
                TweenMax.set(dateContainer, {alpha: 0});
                slideTexts = textsContainer.children.map((child, i) => Object.assign({child}, options.itemsTitles[i]));
            }
        }

        function getFontStyle(properties, orientation) {
            const titleStyle = properties.title[orientation];
            const maxSize = titleStyle.maxSize || Number.POSITIVE_INFINITY;
            let fontSize, strokeThickness;
            if (titleStyle.rsize) {
                if (titleStyle.vertical) {
                    fontSize = titleStyle.rsize * renderer.view.height;
                } else {
                    fontSize = titleStyle.rsize * renderer.view.width;
                }
                fontSize = Math.min(fontSize, maxSize * devicePixelRatio);
            } else {
                fontSize = titleStyle.size * devicePixelRatio;
            }
            strokeThickness = titleStyle.stroke || 3 * fontSize / 200;
            return {fontSize, strokeThickness};
        }

        function resizeDate(orientation, language) {
            const title = textsContainer.children[0];
            const dateSubtitle = dateContainer.children[0];
            const text = subtitle[language];
            dateSubtitle.text = text;
            dateSubtitle.anchor.set(0.5, 0.1);
            dateSubtitle.x = title.x;
            dateSubtitle.y = title.getBounds().bottom;
            dateSubtitle.style.fontSize = title.style.fontSize * 0.25;
        }

        function resizeText(textTitle, item, orientation, language) {
            const title = item.title;
            const text = item.title.text[language] || item.title.text;
            const style = title[orientation];
            const anchor = style.anchor;
            const x = style.x;
            const y = style.y;
            const rx = style.rx;
            const ry = style.ry;
            const vertical = style.vertical;
            textTitle.text = text;
            if (typeof anchor === 'number') {
                textTitle.anchor.set(anchor);
            } else if (anchor) {
                textTitle.anchor.set(anchor.x, anchor.y);
            }
            if (x === 0 || x) {
                textTitle.x = x;
            }
            if (y === 0 || y) {
                textTitle.y = y;
            }
            if (rx === 0 || rx) {
                textTitle.x = rx * renderer.width;
            }
            if (ry === 0 || ry) {
                textTitle.y = ry * renderer.height;
            }

            if (vertical) {
                textTitle.angle = -90;
            } else {
                textTitle.angle = 0;
            }
            const fontStyle = getFontStyle(item, orientation);
            textTitle.style.fontSize = fontStyle.fontSize;
            textTitle.style.strokeThickness = fontStyle.strokeThickness;
        }

        function resizeTexts() {
            const orientation = getOrientation();
            const language = getLanguage();
            slideTexts.forEach((item) => resizeText(item.child, item, orientation, language));
            resizeDate(orientation, language);
        }


        ///////////////////////////////
        //  Slide transition effect
        ///////////////////////////////

        function slideTransition(next) {
            return new Promise((resolve) => {

                // center displacement
                dispSprite.anchor.set(0.5);
                dispSprite.x = renderer.width / 2;
                dispSprite.y = renderer.height / 2;

                // set timeline with callbacks
                timelineTransition = new TimelineMax({
                    onStart: function () {
                        // update playing flag
                        is_playing = true;
                        // update draging flag
                        is_swipping = false;

                        dispSprite.rotation = 0;
                    },

                    onComplete: function () {
                        // reset rgb values
                        if (options.textsRgbEffect === true) {
                            splitRgb.red = [0, 0];
                            splitRgb.green = [0, 0];
                            splitRgb.blue = [0, 0];
                        }

                        if (options.imagesRgbEffect === true) {
                            splitRgbImgs.red = [0, 0];
                            splitRgbImgs.green = [0, 0];
                            splitRgbImgs.blue = [0, 0];
                        }

                        // update flags
                        is_playing = false;
                        is_swipping = false;

                        // after the first transition
                        // will prevent first animation transition
                        is_loaded = true;

                        // set new index
                        currentIndex = next;
                        return resolve();
                    },

                    onUpdate: function () {

                        dispSprite.rotation = options.transitionSpriteRotation; // frequency
                        dispSprite.scale.set(timelineTransition.progress() * options.transitionScaleIntensity);

                        const rgbProgress = timelineTransition.progress();

                        if (is_loaded === true) {

                            // rgb shift effect for navigation transition
                            // if text rgb effect is enable
                            if (options.textsRgbEffect === true) {

                                // on first half of transition
                                // match splitRgb values with timeline progress / from 0 to x
                                if (rgbProgress < 0.5) {
                                    splitRgb.red = [rgbProgress * options.navTextsRgbIntensity, 0];
                                    splitRgb.green = [0, 0];
                                    splitRgb.blue = [-rgbProgress, 0];
                                }
                                // on second half of transition
                                // match splitRgb values with timeline progress / from x to 0
                                else {
                                    splitRgb.red = [-(options.navTextsRgbIntensity - rgbProgress * options.navTextsRgbIntensity), 0];
                                    splitRgb.green = [0, 0];
                                    splitRgb.blue = [options.navTextsRgbIntensity - rgbProgress * options.navTextsRgbIntensity, 0];
                                }
                            }

                            // if img rgb effect is enable
                            if (options.imagesRgbEffect === true) {

                                // on first half of transition
                                // match splitRgb values with timeline progress / from 0 to x
                                if (rgbProgress < 0.5) {
                                    splitRgbImgs.red = [-rgbProgress * options.navImagesRgbIntensity, 0];
                                    splitRgbImgs.green = [0, 0];
                                    splitRgbImgs.blue = [rgbProgress, 0];
                                }

                                // on second half of transition
                                // match splitRgb values with timeline progress / from x to 0
                                else {
                                    splitRgbImgs.red = [-(options.navImagesRgbIntensity - rgbProgress * options.navImagesRgbIntensity), 0];
                                    splitRgbImgs.green = [0, 0];
                                    splitRgbImgs.blue = [options.navImagesRgbIntensity - rgbProgress * options.navImagesRgbIntensity, 0];
                                }
                            }
                        }
                    }
                });

                // make sure timeline is finished
                timelineTransition.clear();
                if (timelineTransition.isActive()) {
                    return;
                }

                var scaleAmp;

                // prevent first animation transition
                if (is_loaded === false) {
                    scaleAmp = 0;
                }
                // the first transition is done > applly effect
                else {
                    scaleAmp = options.transitionScaleAmplitude;
                }

                const currentContainers = [slideImages[currentIndex], slideTexts[currentIndex].child];
                if (currentIndex === 0) currentContainers.push(dateContainer);

                const nextContainers = [slideImages[next], slideTexts[next].child];
                if (next === 0) nextContainers.push(dateContainer);
                timelineTransition
                    .to(dispFilter.scale, options.slideTransitionDuration, {
                        x: scaleAmp,
                        y: scaleAmp,
                        ease: Power2.easeIn
                    })
                    .to(currentContainers, options.slideTransitionDuration, {
                        alpha: 0,
                        ease: Power2.easeOut
                    }, options.slideTransitionDuration * 0.5)
                    .to(nextContainers, options.slideTransitionDuration, {
                        alpha: 1,
                        ease: Power2.easeOut
                    }, options.slideTransitionDuration * 0.5)
                    .to(dispFilter.scale, options.slideTransitionDuration, {
                        x: 0,
                        y: 0,
                        ease: Power1.easeOut
                    }, options.slideTransitionDuration);
            });
        }

        ///////////////////////////////    

        //  Mouse move event

        ///////////////////////////////

        function cursorInteractive() {
            // mousemove event
            // because pixi stage has a 1.15 scale factor,
            // we need to use native listener in order to get the real mouse coordinates (not affected by scale)
            window.addEventListener("mousemove", onPointerMove);
            window.addEventListener("touchmove", onTouchMove);

            // track user mouse position
            function onPointerMove(e) {
                posx = e.clientX * devicePixelRatio;
                posy = e.clientY * devicePixelRatio;
            }

            function onTouchMove(e) {
                posx = e.touches[0].clientX * devicePixelRatio;
                posy = e.touches[0].clientY * devicePixelRatio;
            }

            // enable raf loop
            mainLoop();
        }


        ///////////////////////////////    

        //  Main loop for animations

        ///////////////////////////////

        function mainLoop() {
            // enable raf animation
            mainLoopID = requestAnimationFrame(mainLoop);

            // if user is out of screen
            if (posy <= 0 || posx <= 0 || (posx > (window.innerWidth * devicePixelRatio) || posy > (window.innerHeight * devicePixelRatio))) {
                is_moving = false;
                // re-init values
                posx = vx = window.innerWidth * devicePixelRatio / 2;
                posy = vy = window.innerHeight * devicePixelRatio / 2;
                kineX = kineY = newkineX = newkineY = 0;

            } else {
                is_moving = true;
            }

            // get mouse position with momentum
            vx += ((posx - vx) * options.cursorMomentum);
            vy += ((posy - vy) * options.cursorMomentum);

            // update kineX / kineY based on posx / posy and vx / vy
            kineX = Math.floor(posx - vx);
            kineY = Math.floor(posy - vy);

            // enable text tilt effect
            if (options.textsTiltEffect === true) {
                tilt(currentIndex, kineX, kineY)
            }

            // if flag has changed 
            if (is_moving === true) {
                // update cursor displacement sprite positions on cursor moving
                dispSprite_2.x = vx;
                dispSprite_2.y = vy;

                TweenMax.to(dispFilter_2.scale, 0.5, {
                    x: kineX * options.cursorScaleIntensity,
                    y: kineY * options.cursorScaleIntensity,
                    ease: Power4.easeOut
                });
            }

            // make background displacement follow mouse position on transition events
            if ((is_playing)) {
                dispSprite.x = vx;
                dispSprite.y = vy;
            }

            // if user is swipping 
            if (is_swipping) {

                // update slide displacement sprite positions
                dispSprite.x = vx;
                dispSprite.y = vy;
                // move displacement filter to cursor position 
                dispFilter.x = vx;
                dispFilter.y = vy;
                // map displacement filter scale value with user swipping intensity
                dispFilter.scale.x = kineX * (options.swipeScaleIntensity);
                dispFilter.scale.y = kineY * (options.swipeScaleIntensity);

                // if text rgb effect enable
                if (options.textsRgbEffect === true) {
                    splitRgb.red = [(kineX * options.textsRgbIntensity), 0];
                    splitRgb.green = [0, 0];
                    splitRgb.blue = [(-kineX * options.textsRgbIntensity), 0];
                }
                // if img rgb effect enable
                if (options.imagesRgbEffect === true) {
                    splitRgbImgs.red = [(kineX * options.imagesRgbIntensity), 0];
                    splitRgbImgs.green = [0, 0];
                    splitRgbImgs.blue = [(-kineX * options.imagesRgbIntensity), 0];
                }
            }
        }

        ///////////////////////////////    

        //  Texts tilt effect

        ///////////////////////////////

        function tilt(currentIndex, kineX, kineY) {
            const orientation = getOrientation();
            if (options.itemsTitles.length > 0) {
                const currentText = slideTexts[currentIndex];
                const position = currentText.title[orientation];
                TweenMax.to(currentText.child, 2, {
                    x: position.rx * renderer.width - (kineX * 0.1),
                    y: position.ry * renderer.height - (kineY * 0.2),
                    ease: Expo.easeOut
                });

                if (currentIndex === 0) {
                    const dateY = currentText.child.getBounds().bottom;
                    TweenMax.to(dateContainer.getChildAt(0), 2, {
                        x: position.rx * renderer.width - kineX * 0.25,
                        y: dateY - kineY * 0.2,
                        ease: Expo.easeOut
                    })
                }

            }
        }


        ///////////////////////////////    

        //  init 

        ///////////////////////////////

        function resize() {
            console.log('resizeCanvas');
            renderer.resize(window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio);
            renderer.view.style.transform = `scale(${1 / devicePixelRatio})`;
            const size = Math.max(window.innerHeight, window.innerWidth);
            dispSprite_2.height = devicePixelRatio * size / 1.5;
            dispSprite_2.width = devicePixelRatio * size / 1.5;
            resizeImgs();
            resizeTexts();
            renderer.render(stage);
        }

        function init() {
            // re init renderer on ready
            renderer.resize(window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio);
            renderer.view.style.transform = `scale(${1 / devicePixelRatio})`;
            renderer.view.style.transformOrigin = '0 0';

            // construct
            build_scene();
            buildImgs();

            function onLoad() {
                buildTexts();
                // interactivity
                cursorInteractive();
                slideTransition(currentIndex);
                // Listen for window resize events
                window.resizeCanvas = resize;
            }

            if (window.document.readyState === 'complete') {
                onLoad();
            } else {
                window.addEventListener('load', onLoad);
            }
        }

        // Load them google fonts before starting...!
        window.WebFontConfig = {
            custom: {
                families: ['trash:600', 'walsheim:400'],
            },
            active: function () {
                // load the stage images 
                imagesLoaded(images, function () {
                    document.body.classList.remove('loading');
                    document.body.classList.add('image-loaded');

                    let hash = location.hash.slice(1);
                    if (hash === 'orga') {
                        hash = 'contributions';
                    }
                    if (hash) {
                        const nav = document.querySelector(`.main-nav.${hash}`);
                        if (nav) {
                            currentIndex = parseInt(nav.getAttribute('data-nav'));
                        }
                    }
                    // init slider
                    init();
                });
            }
        };

        window.slideTo = (index) => slideTransition(index);
        window.setBlur = (value) => {
            blur.blur = value;
        };
        window.getBlur = () => blur.blur;
    };
})();
