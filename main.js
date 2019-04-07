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
var background = new THREE.Mesh(geometryCube, new THREE.MeshStandardMaterial({
    envMap: envCube
}));

var grey_metal_material = new THREE.MeshStandardMaterial( {
    color: 0x222222,
    roughness: 0,
    metalness: 0.5,
    envMap: envCube
});
var blue_metal_material = new THREE.MeshStandardMaterial( {
    color: 0x0000FF,
    roughness: 0,
    metalness: 0.5,
    envMap: envCube
});
var red_metal_material = new THREE.MeshStandardMaterial( {
    color: 0xFF0000,
    roughness: 0,
    metalness: 0.5,
    envMap: envCube
});

var shader = THREE.FresnelShader;
var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
uniforms[ "tCube" ].value = envCube;
var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms };
var bubble_material = new THREE.ShaderMaterial( parameters );


var objects = {
    torus: {src:"TORUS2.obj", position:{x:0.6,y:0,z:-0.6}, scale:0.008, chapter:'infos', material:grey_metal_material},
    bubble: {src:"BUBBLE.obj", position:{x:0.3,y:0.3,z:0}, scale:0.008, chapter:'ethos', material:bubble_material},
    cloud: {src:"CLOUD.obj", position:{x:-0.6,y:0,z:-0.6}, scale:0.008, chapter:'ethos', material:blue_metal_material},
    dragon_froot: {src:"DRAGON_FROOT.obj", position:{x:-0.6,y:-0.6,z:0}, scale:0.008, chapter:'contributions', material:blue_metal_material},
    eyecat_ball: {src:"EYECAT_BALL.obj", position:{x:0,y:0.6,z:-0.6}, scale:0.006, chapter:'infos', material:blue_metal_material},
    ruby_cube: {src:"RUBY_CUBE.obj", position:{x:0,y:0,z:0}, scale:0.008, chapter:'contributions', material:red_metal_material}
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


///// OBJECTS
var geometrySphere = new THREE.SphereGeometry(4, 6, 6);
var materialGlobe = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    wireframe : true
});

var sphere = new THREE.Mesh( geometrySphere, materialGlobe );

sphere.position.x = 0;
sphere.name = 'sphere';
scene.add(sphere);

/////// LIGHTS
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
var light = new THREE.DirectionalLight(0xffffff, 0.9);
light.castShadow = true;
scene.add(light);
scene.add(ambientLight);



/////// CONTROLS

controls = new THREE.OrbitControls(camera);
controls.enablePan = true;
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

var mouse = new THREE.Vector2(), INTERSECTED;

var raycaster = new THREE.Raycaster();
var intersects;
var contentHidden = true;

function clickHandler(event) {
    if (INTERSECTED) {
        console.log(INTERSECTED);
        console.log(INTERSECTED.parent.name);
        console.log(INTERSECTED.name);
        showContent(objects[INTERSECTED.parent.name].chapter);
    }
}

document.addEventListener('mousemove', function () {
    mouse.x = + (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}, false);

document.addEventListener('touchstart', function () {
    mouse.x = + (event.targetTouches[0].pageX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
}, false);

document.addEventListener('mousedown', clickHandler);

window.onload = function () {
    $('canvas').bind('tap', clickHandler);
    $.mobile.loading().hide();
};


/// ASSETS LOADING
function loadModel() {

}

var manager = new THREE.LoadingManager( loadModel );

manager.onProgress = function ( item, loaded, total ) {
    console.log( item, loaded, total );
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
        console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
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
            console.log(obj);
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
            console.log(objects[key].obj);
            scene.add( objects[key].obj );
            objects_in_scene.push(objects[key].obj)
        }, onProgress, onError );
    }
}

load_objects();


function render() {
    raycaster.setFromCamera(mouse, camera);

    intersects = raycaster.intersectObjects(objects_in_scene, true);
    if(intersects.length > 0 && contentHidden) {
        if (INTERSECTED !== intersects[0].object) {
            console.log(intersects[0].object.name);
            INTERSECTED = intersects[0].object;
        }
    } else {
        INTERSECTED = null;
    }

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

render();

window.scene = scene;


function showContent(chapter) {
    console.log(chapter);
    var container = document.getElementById('content-container');
    var chapter_div = document.getElementById(chapter);
    var active_div = container.getElementsByClassName('active');
    for (var i = 0; i < active_div.length; i++) {
        active_div[i].classList.remove('active');
    }
    chapter_div.classList.add("active");
    container.classList.add('active');
    contentHidden = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
}

function closeContent() {
    var container = document.getElementById('content-container');
    var active_div = container.getElementsByClassName('active');
    for (i = 0; i < active_div.length; i++) {
        active_div[i].classList.remove('active');
    }
    container.classList.remove('active');
    contentHidden = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
}

window.onresize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    $(document.body).width(window.innerWidth).height(window.innerHeight);
};

$(function() {
    window.onresize();
    $('.accordion-item').on('click', function (event) {
        var target = $(event.currentTarget);
        if (target.hasClass('active')) {
            target.removeClass('active');
        }
        else {
            target.addClass('active');
        }
    })
});
