window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

// output is in the range of [0, 1]
// t is the elapsed time and d is the duration
Math.linearInOut = function(t, d) {
  if (t > d / 2) {
    return 2 - (t / (d / 2));
  } else {
    return t / (d / 2);
  }
}

window.onload = function() {
  DoCanvasEffect('canvas');
}

function DoCanvasEffect(canvas_id) {
  // scene options:
  var follow = true;
  var follow_opacity = true;
  var speed = .20;

  var canvas = document.getElementById(canvas_id);
  var dt = 16.667;

  //Make the canvas occupy the full page
  var W = window.innerWidth,
    H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext("2d");

  var particles = [];
  var mouse = {};

  // track mouse
  canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  }, false);

  // create particles
  var total = 50;
  for (var i = 0; i < total; i++) {
    particles.push(new particle(true));
  }

  function particle(dead) {
    var a = Math.PI * 2 * Math.random();
    this.speed = {
      x: Math.cos(a) * 6 * speed,
      y: Math.sin(a) * 6 * speed
    };

    // location = mouse coordinates
    // Now the flame follows the mouse coordinates
    if (mouse.x && mouse.y && follow) {
      this.location = {
        x: mouse.x + -150 + Math.random() * 300,
        y: mouse.y + -150 + Math.random() * 300
      };
    } else {
      this.location = {
        x: W / 2,
        y: H / 2
      };
    }

    // radius range = 10-30
    this.radius = 2 + Math.random() * 58;
    if (dead) this.radius = 0;

    // life range = 1500-5000ms
    this.time = 1500 + Math.random() * 3500;
    this.duration = this.time;

    // color
    this.r = Math.round(Math.random() * 50);
    this.b = 150 + Math.round(Math.random() * 105);
    this.g = 0; //Math.round(Math.random()*255);
  }

  function draw() {
    if ((!mouse.x || !mouse.y) && follow_opacity) {
      window.requestAnimFrame(draw);
      return;
    }

    // clear the canvas with an image:
    ctx.clearRect(0, 0, W, H);

    // draw particles:
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.beginPath();
      var x = p.location.x,
        y = p.location.y;
      var o = Math.linearInOut(p.time, p.duration) * 0.50;
      if (follow_opacity) {
        var dx = mouse.x - x;
        var dy = mouse.y - y;
        var dist = (Math.sqrt(dx * dx + dy * dy) || 200);
        o *= 1 - (dist / 200);
      }
      p.opacity = o != NaN ? o : p.opacity;

      var gradient = ctx.createRadialGradient(x, y, 0, x, y, p.radius);
      gradient.addColorStop(0, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
      gradient.addColorStop(0.8, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
      gradient.addColorStop(1, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", 0)");
      ctx.fillStyle = gradient;
      ctx.arc(p.location.x, p.location.y, p.radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();

      // some basic physics to move and animate the particles
      p.time -= dt;
      p.radius -= 0.25;
      p.location.x += p.speed.x;
      p.location.y += p.speed.y;

      // check if the particle has finished:
      if (p.radius < 0 || p.time < 0) {
        particles[i] = new particle(); // reset it
      }
    }

    window.requestAnimFrame(draw);
  }

  window.requestAnimFrame(draw);
}