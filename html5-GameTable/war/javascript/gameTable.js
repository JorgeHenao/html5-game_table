var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

$(window).load(function() {
   gameTable.init();    
});

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
                window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            },
                    timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


var gameTable = {    
    init: function() {      
        mouse.init();  
        box2d.init();
        
        var width = 40, height = 50, positionX = 540, positionY = 280;        
        box2d.createRectangularBody(width, height, positionX, positionY);
        
        animate(); 
        
        gameTable.canvas = $('#debugcanvas')[0];
        gameTable.context = gameTable.canvas.getContext('2d');
    }
};



var box2d = {
    scale:30,
    init: function() {
        //Set up the Box2D world that will do most of the physics calculation
        //Se declara la gravedad, ya que no se depende de ella se inicializa en cero
        var varGravity = 0;
        var gravity = new b2Vec2(0, varGravity);

        //Deja los objetos que estan en reposo y los excluye de los calculos
        var allowSleep = true;
        box2d.world = new b2World(gravity, allowSleep);
        
        // Setup debug draw
        var debugContext = document.getElementById('debugcanvas').getContext('2d');
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(debugContext);
        debugDraw.SetDrawScale(box2d.scale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        box2d.world.SetDebugDraw(debugDraw);        
    },
    
    createRectangularBody: function(width, height, positionX, positionY) {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = (positionX / 2) / box2d.scale;
        bodyDef.position.y = (positionY / 2) / box2d.scale;

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.5;
        fixtureDef.restiturion = 0.3;

        fixtureDef.shape = new b2PolygonShape;
        fixtureDef.shape.SetAsBox(width / box2d.scale, height / box2d.scale);

        var body = box2d.world.CreateBody(bodyDef);
        fixture = body.CreateFixture(fixtureDef);
    }        
};

//se crea un cuaerpo estatico
function createFloor() {
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = 540 / 2 / scale;
    bodyDef.position.y = 280 / 2 / scale;

    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.2;

    fixtureDef.shape = new b2PolygonShape;
    fixtureDef.shape.SetAsBox(200 / scale, 100 / scale);

    var body = world.CreateBody(bodyDef);
    var fixture = body.CreateFixture(fixtureDef);
}


var timeStep = 1 / 60;
var velocityIterations = 8;
var positonIterations = 3;
function animate() {
    obtainBody();
    
    box2d.world.Step(timeStep, velocityIterations, positonIterations);
    box2d.world.ClearForces();
    box2d.world.DrawDebugData();

    setTimeout(animate, timeStep);
}



function obtainBody() {

    if (mouse.dragging) {

        var positionMouse = new b2Vec2(mouse.x / 30, mouse.y / 30);

        //lista de los bodies en el mundo box2d 
        var listaBody = box2d.world.GetBodyList();        
        while (listaBody) {
            //se obtiene las fixture del body 
            var fix = listaBody.GetFixtureList();
            while (fix) {                
                var shaper = fix.GetShape();
                //se comprueba si el mouse se encuentra sobre un body
                var inside = shaper.TestPoint(fix.GetBody().GetTransform(), positionMouse);                
                if (inside) {
                    movePicture(listaBody);                   
                }                
                fix = fix.GetNext();
            }
            listaBody = listaBody.GetNext();
        }
    }

}


function movePicture(body) {    
    //se obtiene la posicion del body selecionado por el raton
    var position = body.GetPosition();
   
    position.x = mouse.x / box2d.scale;
    position.y = mouse.y / box2d.scale;
}



var mouse = {
    x: 0,
    y: 0,
    down: false,
    init: function() {
        $('#debugcanvas').mousemove(mouse.mousemovehandler);
        $('#debugcanvas').mousedown(mouse.mousedownhandler);
        $('#debugcanvas').mouseup(mouse.mouseuphandler);
        $('#debugcanvas').mouseout(mouse.mouseuphandler);
    },
    mousemovehandler: function(ev) {
        var offset = $("#debugcanvas").offset();

        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;

        if (mouse.down) {
            mouse.dragging = true;
        }
    },
    mousedownhandler: function(ev) {
        mouse.down = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
        ev.originalEvent.preventDefault();
    },
    mouseuphandler: function(ev) {
        mouse.down = false;
        mouse.dragging = false;
    }
};