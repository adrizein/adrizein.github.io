var OBJECT_TO_CHAPTERS = {
    'RAINBOW_BLOB': 'ethos',
    'Torus.2': 'infos',
    'cube': 'contributions',
    'LOD3spShape': 'ethos',
};


if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

window.scene = new THREE.Scene();

var fov = 30;
var aspect = window.innerWidth / window.innerHeight;
var near = 0.1;
var far = 100;


var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
var renderer = new THREE.WebGLRenderer({alpha:true });


renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );


///// OBJECTS

var geometryCube = new THREE.BoxGeometry(1, 1, 1);
var materialCube = new THREE.MeshLambertMaterial( { color: 0x2233ee } );

var geometrySphere = new THREE.SphereGeometry(1, 32, 32);
var materialGlobe = new THREE.MeshPhongMaterial({
    wireframe : true
});
var cube = new THREE.Mesh( geometryCube, materialCube );
var sphere = new THREE.Mesh( geometrySphere, materialGlobe );
var flubber;
var torus;



var scale = 0.5;
cube.scale.set(scale, scale, scale);
cube.position.x = 0.7;
cube.name = 'cube';


sphere.position.x = 0;
sphere.name = 'sphere';

scene.add( cube );
scene.add( sphere );

//scene.add( cube1 );
//scene.add( cube2 );
camera.position.z = 6;

//cube.position.x = Math.cos(time)/1;

//mesh.rotation.y = THREE.Math.degToRad(45);


/////// LIGHTS
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
var light = new THREE.DirectionalLight(0xffffff, 0.9);
light.castShadow = true;
scene.add(light);
scene.add(ambientLight);



///// BACKGROUND
var geometry = new THREE.BoxBufferGeometry(50, 50, 50);
// invert the geometry on the x-axis so that all of the faces point inward
geometry.scale( - 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load( 'textures/background_2.jpg' )
} );
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);




/////// CONTROLS

controls = new THREE.OrbitControls(camera);
controls.enablePan = false;
controls.enableZoom = false;
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

function clickHandler( event ) {
    if (INTERSECTED) {
        console.log(INTERSECTED.name);
        showContent(OBJECT_TO_CHAPTERS[INTERSECTED.name]);
    }
}

document.addEventListener( 'mousemove', function () {
    mouse.x = + (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}, false );

document.addEventListener( 'touchstart', function () {
    mouse.x = + (event.targetTouches[0].pageX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
}, false);

document.addEventListener('click', clickHandler);

window.onload = function () {
    $('canvas').bind('tap', clickHandler);
    $.mobile.loading().hide();
}

/////// GROUP
/*
var group = new THREE.Group();
scene.add( group );

cube.name = 'cube';
group.add( cube );
group.add( sphere );


mesh2.visible = false;
group.remove( mesh2 );

group.children // mesh1
group.parent // scene
*/

// ASSETS LOADING


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


var loader = new THREE.OBJLoader( manager ).setPath('assets/');

loader.load( 'rainbow_flubber.obj', function ( obj ) {
    flubber = obj;
    flubber.traverse( function ( child ) {
        if ( child.isMesh ) child.material.map = texture;
    } );
    flubber.position.y = - 0.8;
    flubber.scale.set(0.01, 0.01, 0.01);
    flubber.name = 'flubber';
    scene.add( flubber );
}, onProgress, onError );

loader.load('torus.obj', function ( obj ) {
    torus = obj;
    torus.scale.set(0.002, 0.002, 0.002);
    torus.position.x = - 0.8;
    torus.name = 'torus';
    scene.add( torus );
}, onProgress, onError );


var loader_gltf = new THREE.GLTFLoader().setPath('assets/');

loader_gltf.load('duck.glb',
    function (gltf) {
        gltf.scene.scale.set(0.5, 0.5, 0.5);
        gltf.scene.position.z = -0.8;
        gltf.scene.name = 'duckScene';
        scene.add(gltf.scene);
    },
    function (xhr) {
        console.log('loading', xhr.loaded * 100 / xhr.total);
    },
    function (error) {
        console.error(error);
    }
);


window.onresize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};



function render() {
    raycaster.setFromCamera(mouse, camera);

    var duck = scene.getObjectByName('LOD3spShape');
    if (flubber &&
        cube &&
        torus &&
        duck) {
        intersects = raycaster.intersectObjects([flubber, cube, torus, duck], true);
        if( intersects.length > 0 && contentHidden) {
            if (INTERSECTED !== intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex(0x006600);
            }
        } else {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = null;
        }
    }

    controls.update();
    renderer.render( scene, camera );

    requestAnimationFrame(render);
}

render();

window.scene = scene;


function showContent(chapter) {
    console.log(chapter);
    var container = document.getElementById('content-container');
    var chapter_div = document.getElementById(chapter);
    var active_div = container.getElementsByClassName('active');
    for (i = 0; i < active_div.length; i++) {
        active_div[i].classList.remove('active');
    }
    chapter_div.classList.add("active");
    container.classList.add('active');
    contentHidden = false;
    controls.enableRotate = false;
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
}

document.body.addEventListener('touchmove', function(event) {
    console.log(event.source);
    //if (event.source == document.body)
    event.preventDefault();
}, false);

window.onresize = function() {
    $(document.body).width(window.innerWidth).height(window.innerHeight);
};

$(function() {
    window.onresize();
});
