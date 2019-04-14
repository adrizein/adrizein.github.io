$(function() {
    if (WEBGL.isWebGLAvailable() === false) {
        document.body.appendChild( WEBGL.getWebGLErrorMessage() );
    }

    var envCube = new THREE.CubeTextureLoader()
        .setPath('textures/env/')
        .load([
            'px.png',
            'nx.png',
            'py.png',
            'ny.png',
            'pz.png',
            'nz.png'
        ]);

    var geometryCube = new THREE.BoxGeometry(50, 50, 50);
    geometryCube.scale(-1, 1, 1);

    var grey_metal_material = new THREE.MeshStandardMaterial( {
        color: 0x444444,
        roughness: 0,
        metalness: 0.5,
        envMap: envCube
    });
    var blue_metal_material = new THREE.MeshStandardMaterial( {
        color: 0x3080ff,
        roughness: 0,
        metalness: 0.5,
        envMap: envCube
    });
    var red_metal_material = new THREE.MeshStandardMaterial( {
        color: 0xef0000,
        roughness: 0,
        metalness: 0.5,
        envMap: envCube
    });

    var white_material = new THREE.MeshStandardMaterial( {
        color: 0xffffff,
        roughness: 0,
        metalness: 0,
        envMap: envCube
    });

    var transparent_material = new THREE.MeshStandardMaterial( {
        alphaMap: 0xef0000,
        color: 0xff0000,
        roughness: 0,
        metalness: 0,
        envMap: envCube
    });

    var shader = THREE.FresnelShader;
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    uniforms[ "tCube" ].value = envCube;
    var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms };
    var bubble_material = new THREE.ShaderMaterial( parameters );


    var objects = {
        torus: {src:"TORUS2.obj", position:{x:0.6,y:0,z:-0.6}, scale:0.008, chapter:'definitions', material:grey_metal_material},
        bubble: {src:"BUBBLE.obj", position:{x:0.3,y:0.3,z:0}, scale:0.008, chapter:'ethos', material:bubble_material},
        cloud: {src:"CLOUD.obj", position:{x:-0.6,y:0,z:-0.6}, scale:0.008, chapter:'curiosities', material:blue_metal_material},
        dragon_froot: {src:"DRAGON_FROOT.obj", position:{x:-0.6,y:-0.6,z:0}, scale:0.008, chapter:'contributions', material:blue_metal_material},
        eyecat_ball: {src:"EYECAT_BALL.obj", position:{x:0,y:0.6,z:-0.6}, scale:0.006, chapter:'eros', material:white_material},
        ruby_cube: {src:"RUBY_CUBE.obj", position:{x:0,y:0,z:0}, scale:0.008, chapter:'infos', material:red_metal_material},
        sphere: {src: "SPHERE.obj", position: {x: 0, y: 0, z: 0}, scale: 0.008, material: white_material},
    };


    window.scene = new THREE.Scene();
    window.scene.background = envCube;

    var fov = 30;
    var aspect = window.innerWidth / window.innerHeight;
    var near = 0.1;
    var far = 100;


    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 4;
    camera.position.y = 0.5;
    camera.position.x = -1;


    var renderer = new THREE.WebGLRenderer({alpha:true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );


    /////// LIGHTS
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    var light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.castShadow = true;
    scene.add(light);
    scene.add(ambientLight);



    /////// CONTROLS
    controls = new THREE.OrbitControls(camera);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.5;

    /*
    controls.minDistance = 1
    controls.maxDistance = 100

    controls.minPolarAngle
    controls.maxPolarAngle
    */


    /////// INTERACTIONS
    var all = $('#all');
    var mouse = new THREE.Vector2(), INTERSECTED;

    var raycaster = new THREE.Raycaster();
    var intersects;
    var dragging = 0;
    var contentHidden = true;

    function clickHandler(event) {
        if (contentHidden) {
            var menuParents = $(event.target).parents().filter(function (_, e) {
                return e.classList.contains('menu')
            });

            if (!menuParents.length) {
                all.addClass('cursor-drag');
                dragging = 1;
            }
        }
    }

    document.addEventListener('mousemove', function (event) {
        mouse.x = + (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        if (dragging === 1) {
            dragging = 2;
        }
    }, {passive: true});

    document.addEventListener('touchstart', function () {
        mouse.x = + (event.targetTouches[0].pageX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
    }, {passive: true});

    document.addEventListener('mousedown', clickHandler, {passive: true});
    document.addEventListener('mouseup', function() {
        if (contentHidden) {
            if (INTERSECTED && dragging < 2) {
                showContent(objects[INTERSECTED.parent.name].chapter);
            }
            all.removeClass('cursor-drag');
        }
    }, {passive: true});

    window.onload = function () {
        $('canvas').bind('tap', clickHandler);
        $.mobile.loading().hide();
    };


    ///// ASSETS LOADING
    function loadModel() {

    }

    var manager = new THREE.LoadingManager( loadModel );

    manager.onProgress = function ( item, loaded, total ) {
    };

    // texture
    var textureLoader = new THREE.TextureLoader( manager );
    var texture = textureLoader.load( 'textures/gradient.jpeg' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );

    // model
    function onProgress( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
        }
    }

    function onError(err) {
        console.error(err)
    }

    var objects_in_scene = [];

    function load_objects() {
        var loader = new THREE.OBJLoader( manager ).setPath('assets/');

        for (const key in objects) {

            loader.load(objects[key].src, function ( obj) {
                objects[key].obj = obj;
                objects[key].obj.scale.set(objects[key].scale, objects[key].scale, objects[key].scale);
                objects[key].obj.position.x = objects[key].position.x;
                objects[key].obj.position.y = objects[key].position.y;
                objects[key].obj.position.z = objects[key].position.z;
                objects[key].obj.name = key;
                if (objects[key].material) {
                    objects[key].obj.traverse( function ( child ) {
                        if ( child instanceof THREE.Mesh ) {
                            child.material = objects[key].material;
                        }
                    } );
                }
                scene.add(objects[key].obj);
                if (objects[key].chapter) {
                    objects_in_scene.push(objects[key].obj)
                }
            }, onProgress, onError );
        }
    }

    load_objects();


    function render() {
        if (contentHidden) {
            var coords = [mouse];
            var r = 104 / innerWidth;
            for (var dx = -10; dx <= 10; dx += 5) {
                for (var dy = -10; dy <= 10; dy += 5) {
                    var x = 2*dx/innerWidth;
                    var y = 2*dy/innerHeight;
                    if (x*x + y*y < r*r) {
                        coords.push(new THREE.Vector2(mouse.x + x, mouse.y + y));
                    }
                }
            }

            for (var i = 0; i < coords.length; i++) {
                var xy = coords[i];
                raycaster.setFromCamera(xy, camera);

                intersects = raycaster.intersectObjects(objects_in_scene, true);
                if (intersects.length > 0) {
                    if (INTERSECTED !== intersects[0].object) {
                        console.log(intersects[0].object.name);
                        INTERSECTED = intersects[0].object;
                        all.addClass('cursor-click');
                    }
                    break;
                }
            }

            if (intersects.length === 0) {
                if (INTERSECTED) {
                    all.removeClass('cursor-click');
                }
                INTERSECTED = null;
            }

            controls.update();
            renderer.render(scene, camera);
        }

        requestAnimationFrame(render);
    }

    window.scene = scene;

    function changeChapter(chapter) {
        var container = $('#content-container');
        var chapter_div = $(`#${chapter}`);
        var active_div = container.find('.active');

        active_div.removeClass('visible');
        setTimeout(function () {
            active_div.removeClass('active');
            chapter_div.addClass("active");
            setTimeout(function () {
                chapter_div.addClass('visible');
            }, 100);
            container.addClass('active');
        }, 1000);
    }

    function showContent(chapter) {
        contentHidden = false;
        INTERSECTED = null;

        changeChapter(chapter);

        $('canvas').addClass('blur');
        $('.menu').addClass('blur');

        all.removeClass('cursor-click');
        all.removeClass('cursor-drag');
        all.addClass('cursor-close');
        all.one('mousedown', function clickOutside(event) {
            console.log(event.target.id);
            if (event.target.id === 'all') {
                closeContent()
            }
            else {
                all.one('mousedown', clickOutside);
            }
        });

        controls.enableRotate = false;
        controls.enableZoom = false;
        window.location.hash = chapter;
    }

    function closeContent() {
        if (!contentHidden) {
            contentHidden = true;
            var container = $('#content-container');

            container.removeClass('active');
            $('canvas').removeClass('blur');
            $('.menu').removeClass('blur');
            all.removeClass('cursor-close');

            controls.enableRotate = true;
            controls.enableZoom = true;
            window.location.hash = '';
        }
    }

    window.closeContent = closeContent;

    $('.accordion-item').on('click', function (event) {
        var target = $(event.currentTarget);
        if (target.hasClass('active')) {
            target.removeClass('active');
        }
        else {
            target.addClass('active');
        }
    });

    window.onresize = function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        $(document.body).width(window.innerWidth).height(window.innerHeight);
    };


    window.onresize();
    render();
    onHash();

    //TODO
    window.onhashchange = onHash;

    function onHash() {
        var chapter = getChapter();
        if (contentHidden) {
            if (chapter) {
              showContent(chapter);
            }
        }
        else {
            if (chapter) {
                changeChapter(chapter);
            }
            else {
                closeContent();
            }
        }
    }

    function getChapter() {
        console.log(window.location.hash);
        if (window.location.hash.length > 1) {
            console.log(window.location.hash);
            return window.location.hash.substr(1).toLowerCase();
        }
    }

    function setLanguage(lang) {
        $("html").attr("lang", lang);
    }

    window.setLanguage = setLanguage;
});

function goTo(url) {
    window.open(url, '_blank');
}
