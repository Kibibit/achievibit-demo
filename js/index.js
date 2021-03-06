console.clear();

$(document).ready(function() {
  var ANIMATIONS = {};

  var SCENES = {};

  var SELECTORS = {
    DEBUG_BUTTON: '.btn',
    ANIMATION_CONTAINER: 'body',
    MARK_HEADER: '#mark-header',
    MARK_CHARACTER_FIRST: '#mark1',
    MARK_CHARACTER_SECOND: '#mark2',
    MARK_CHARACTER_THIRD: '#mark3',
    MARK_CHARACTER_END: '#mark4',
    MARK_FIGHT_SCENE_START: '#mark4',
    TEXT_BOX_1: '#text1',
    TEXT_BOX_2: '#text2',
    TEXT_BOX_3: '#text3'
  };

  FPS(30 /* framesThreshold */ ,
      2 /* dropsThreshold */ ,
      false /* alwaysTrigger */ ,
      true /* showDebugBox */ )
    .on('drops-limit', function(totalDrops) {
      console.log('~= Animation degradation triggered =~');

      if (ANIMATIONS.text1) {
        ANIMATIONS.text1.seek(0).kill();
        ANIMATIONS.text2.seek(0).kill();
        ANIMATIONS.text3.seek(0).kill();
        // don't play the fight scene
        SCENES.fightScene.destroy(true);
        ANIMATIONS.fight.seek('-=0').kill();

        $('.rpg-text-box').addClass('always-show');
        numberOfDrops = 0;

        ANIMATIONS.text1 = ANIMATIONS.text2 = ANIMATIONS.text3 = {
          play: function() {}
        };
      }
    });

  var $container = $(SELECTORS.ANIMATION_CONTAINER);
  var $debugButton = $(SELECTORS.DEBUG_BUTTON);

  // add preview class to animation container to hide the marks
  $container.toggleClass('preview');

  /* make debug button toggle preview class on animation container.
     to show the button, remove the next class from inside the
     .preview class:
      .btn {
          display: none;
      } */
  $debugButton.click(function() {
    $container.toggleClass('preview');
  });

  // create a scene controller, and add 3 scenees:
  // * header - make the header shrink along the scrollbar.
  // * character - handles all animation in the character section,
  //   including the text and background animations.
  // * fight scene - makes the scroll `pause` for a moment
  //   and play the hero \ monster fight scene in fullscreen.
  var controller = createSceneController();
  addHeaderScene(controller);
  addCharacterScenes(controller);
  addFightScene(controller);

  /* ****** *
   * SCENES *
   * ****** */

  function createSceneController() {
    return new ScrollMagic.Controller();
  }

  function addHeaderScene(controller) {
    var headerAnimationObject = createHeaderAnimation();

    ANIMATIONS.header = headerAnimationObject.header;

    var headerScene = new ScrollMagic.Scene({
        triggerElement: SELECTORS.MARK_HEADER,
        duration: headerAnimationObject.duration,
        triggerHook: 0
      })
      .setTween(headerAnimationObject.header)
      .addTo(controller);
  }

  function addCharacterScenes(controller) {
    var character = createCharacterAnimation();

    // rpg text boxes
    var textAnimation1 = createTextAnimation(SELECTORS.TEXT_BOX_1);
    var textAnimation2 = createTextAnimation(SELECTORS.TEXT_BOX_2);
    var textAnimation3 = createTextAnimation(SELECTORS.TEXT_BOX_3);

    ANIMATIONS.text1 = textAnimation1;
    ANIMATIONS.text2 = textAnimation2;
    ANIMATIONS.text3 = textAnimation3;

    var characterScene1 = new ScrollMagic.Scene({
        triggerElement: SELECTORS.MARK_CHARACTER_FIRST,
        triggerHook: 0.7
      })
      .on('enter', function() {
        character.runToPoint(1, 0.4 /* specificTimeScale */ )();
        textAnimation1.play(0);
        console.log('entered first char loc');
      })
      .on('leave', character.runToPoint(0))
      .setClassToggle('#house1', 'visible')
      .addTo(controller);

    var characterScene2 = new ScrollMagic.Scene({
        triggerElement: SELECTORS.MARK_CHARACTER_SECOND,
        triggerHook: 0.7
      })
      .on('enter', function() {
        character.runToPoint(5)();
        textAnimation2.play(0);
        console.log('entered second char loc');
      })
      .on('leave', character.runToPoint(1))
      .setClassToggle('#house2', 'visible')
      .addTo(controller);

    var characterScene3 = new ScrollMagic.Scene({
        triggerElement: SELECTORS.MARK_CHARACTER_THIRD,
        triggerHook: 0.7
      })
      .on('enter', function() {
        character.runToPoint(9)();
        textAnimation3.play(0);
        console.log('entered third char loc');
      })
      .on('leave', character.runToPoint(5))
      .setClassToggle('#house3', 'visible')
      .addTo(controller);

    var characterScene4 = new ScrollMagic.Scene({
        triggerElement: SELECTORS.MARK_CHARACTER_END,
        triggerHook: 'onCenter'
      })
      .on('enter', character.runToPoint(10))
      .on('leave', character.runToPoint(9))
      .addTo(controller);
  }

  function addFightScene(controller) {
    ANIMATIONS.fight = createFightAnimation();

    SCENES.fightScene = new ScrollMagic.Scene({
        triggerElement: SELECTORS.MARK_FIGHT_SCENE_START,
        duration: "200%", // two times the height?
        triggerHook: 0
      })
      .setPin(".hero-fight-parallax")
      .setTween(ANIMATIONS.fight)
      .on('enter', function() {
        console.log('fight scene!');
      })
      .addTo(controller);
  }

  /* ********** *
   * ANIMATIONS *
   * ********** */

  function createTextAnimation(id) {
    if (!id) return;

    // if (lowestFrameRate < 40) return;

    var mySplitText = new SplitText(id, {
      type: 'words,chars'
    });
    var chars = mySplitText.chars;

    var tl = new TimelineMax({
      paused: true
    });
    tl.staggerFrom(chars, 0.8, {
      opacity: 0,
      ease: SteppedEase.config(1)
    }, 0.1, "+=0");

    return tl;
  }

  function createCrowAnimation() {
    var crowAnimation = new TimelineMax({
      repeat: -1
    });

    crowAnimation.set('#crow', {
      opacity: 1,
      backgroundPositionX: "-79px"
    });
    crowAnimation.fromTo('#crow', 2, {
      backgroundPositionX: "-79px",
    }, {
      backgroundPositionX: "-374px",
      ease: SteppedEase.config(8)
    }, 3);
    crowAnimation.set('#crow', {
      opacity: 1,
      backgroundPositionX: "-79px"
    });
    crowAnimation.fromTo('#crow', 2, {
      backgroundPositionX: "-79px",
    }, {
      backgroundPositionX: "0px",
      ease: SteppedEase.config(2)
    });

    return crowAnimation;
  }

  function createCharacterAnimation() {
    var characterObject = {};

    var characterAnimation = new TimelineMax({
      paused: true
    });

    characterAnimation.set('.road .character#char1', {
      opacity: 1
    });
    characterAnimation.fromTo('.road .character#char1', 0.75, {
      backgroundPositionX: "0",
      immediateRender: false
    }, {
      repeat: -1,
      backgroundPositionX: "-96px",
      ease: SteppedEase.config(3)
    }, 0);
    characterAnimation.to('.road .character#char1', 2, {
      top: '100%',
      ease: Power0.easeNone
    }, 0);

    characterAnimation.set('.character#char1', {
      opacity: 0
    }, 2);

    characterAnimation.set('.character#char2', {
      opacity: 1
    }, 2);

    characterAnimation.fromTo('.character#char2', 0.75, {
      immediateRender: false,
      backgroundPositionX: "0",
    }, {
      repeat: -1,
      backgroundPositionX: "-96px",
      ease: SteppedEase.config(3)
    }, 2);

    characterAnimation.to('.character#char2', 2, {
      left: '100%',
      ease: Power0.easeNone
    }, 2);

    characterAnimation.set('.character#char2', {
      opacity: 0
    }, 4);

    characterAnimation.set('.character#char3', {
      opacity: 1
    }, 4);

    characterAnimation.fromTo('.character#char3', 0.75, {
      backgroundPositionX: "0",
      immediateRender: false
    }, {
      repeat: -1,
      backgroundPositionX: "-96px",
      ease: SteppedEase.config(3)
    }, 4);

    characterAnimation.to('.character#char3', 2, {
      top: '100%',
      ease: Power0.easeNone
    }, 4);

    characterAnimation.set('.character#char3', {
      opacity: 0
    }, 6);

    characterAnimation.set('.character#char4', {
      opacity: 1
    }, 6);

    characterAnimation.fromTo('.character#char4', 0.75, {
      backgroundPositionX: "0",
      immediateRender: false
    }, {
      repeat: -1,
      backgroundPositionX: "-96px",
      ease: SteppedEase.config(3)
    }, 6);

    characterAnimation.fromTo('.character#char4', 2, {
      left: '100%'
    }, {
      left: '0%',
      ease: Power0.easeNone
    }, 6);

    characterAnimation.set('.character#char4', {
      opacity: 0
    }, 8);

    characterAnimation.set('.character#char5', {
      opacity: 1
    }, 8);

    characterAnimation.fromTo('.character#char5', 0.75, {
      backgroundPositionX: "0",
      immediateRender: false
    }, {
      repeat: -1,
      backgroundPositionX: "-96px",
      ease: SteppedEase.config(3)
    }, 8);

    characterAnimation.to('.character#char5', 2, {
      top: '100%',
      ease: Power0.easeNone
    }, 8);

    characterObject.animation = characterAnimation;
    characterObject.runToPoint = runToPoint;

    return characterObject;

    function runToPoint(point, specificTimeScale) {
      return function() {
        var currLocation =
          characterObject.animation.duration() *
          characterObject.animation.progress();
        var destination = point || 0;
        setDirection(currLocation, destination);

        characterObject.animation
          .tweenTo(destination, {
            ease: Power0.easeInOut
          })
          .timeScale(specificTimeScale ||
            getSpeed(currLocation, destination));
      };
    }

    function setDirection(currLocation, destination) {
      var isForward = destination - currLocation >= 0;

      isForward ? $('.character').removeClass('reverse') : $('.character').addClass('reverse');
    }

    function getSpeed(currLocation, destination) {
      var speed = Math.abs(destination - currLocation) / 4;
      speed = speed < 0.4 ? 0.4 : speed;
      return speed;
    }
  }

  function createFightAnimation() {
    var monster = document.querySelector("#monster");
    var hero = document.querySelector("#shadow-hero");

    var _fightAnimation = new TimelineLite()
      .fromTo(monster, 3, {
        bottom: '-70%'
      }, {
        bottom: '0%'
      }, 1)
      .fromTo(hero, 4, {
        bottom: '0%'
      }, {
        bottom: '-10%'
      }, 0);

    return _fightAnimation;
  }

  function createHeaderAnimation() {
    var header = document.querySelector("#app-header");
    var bgBack = document.querySelector("#background-back");
    var bgFront = document.querySelector("#background-front");
    var toolbar = document.querySelector("#small-toolbar");
    var largeTitle = document.querySelector("#large-title");
    var smallTitle = document.querySelector("#small-title");

    var deltaHeight = header.offsetHeight - toolbar.offsetHeight;

    var rect1 = smallTitle.getBoundingClientRect();
    var rect2 = largeTitle.getBoundingClientRect();

    var scale = rect1.height / rect2.height;
    var x = rect1.left - rect2.left;
    var y = rect1.top - rect2.top;

    var headerAnimation = new TimelineLite()
      .to(largeTitle, 1, {
        scale: scale,
        x: x,
        y: deltaHeight + y
      }, 0)
      .to(header, 1, {
        y: -deltaHeight
      }, 0)
      .to(toolbar, 1, {
        y: deltaHeight
      }, 0)
      .to(bgBack, 1, {
        y: deltaHeight / 2
      }, 0)
      .to(bgFront, 1, {
        y: deltaHeight / 2
      }, 0)
      .to(bgBack, 1, {
        alpha: 1
      }, 0)
      .to(bgFront, 1, {
        alpha: 0
      }, 0)
      .set(smallTitle, {
        alpha: 1
      }, 1)
      .set(largeTitle, {
        alpha: 0
      }, 1)
      .to(header, 0.4, {
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        ease: Power1.easeOut
      }, 0.6);

    return {
      header: headerAnimation,
      duration: deltaHeight
    };
  }

  function FPS(framesThreshold, dropsThreshold, alwaysTrigger, showDebugBox) {
    var self = {};

    self.framesThreshold = framesThreshold || 30;
    self.dropsThreshold = dropsThreshold || 2;
    self.firstDropsTrigger = true;

    toEmitter(self);

    if (showDebugBox) {
      $('body').append([
        '<div class="hud">',
        'FPS: <span id="framerate">0</span>; ',
        'lowest FPS: <span id="lowest">null</span>; ',
        'DROPS Below ', self.framesThreshold, 'FPS: <span id="drops">0</span>',
        '</div>'
      ].join(''));
    }

    var $framerate = showDebugBox ? document.querySelector("#framerate") : {};
    var $lowest = showDebugBox ? document.querySelector("#lowest") : {};
    var $drops = showDebugBox ? document.querySelector("#drops") : {};
    var prevTime = 0;
    var frames = 0;
    var ticker = TweenLite.ticker;

    var lowestFrameRate = -1;
    var numberOfDrops = 0;

    ticker.addEventListener("tick", update);

    return self;

    function update() {

      var current = ticker.time;

      frames++;

      if (current > prevTime + 1) {
        var fps = Math.round(frames / (current - prevTime));
        $framerate.textContent = fps;
        prevTime = current;
        frames = 0;

        if (lowestFrameRate === -1) {
          lowestFrameRate = fps;
          $lowest.textContent = lowestFrameRate;

          self.trigger('lowest-initialized', lowestFrameRate);
        }

        if (fps < lowestFrameRate) {
          lowestFrameRate = fps;
          console.info('lowest framerate: ' + lowestFrameRate);
          $lowest.textContent = lowestFrameRate;

          self.trigger('lowest-updated', lowestFrameRate);
        }

        if (fps < self.framesThreshold) {
          numberOfDrops++;
          $drops.textContent = numberOfDrops;

          self.trigger('drops-updated', lowestFrameRate);
        }

        if ((alwaysTrigger || self.firstDropsTrigger) && numberOfDrops >= self.dropsThreshold) {
          self.trigger('drops-limit', numberOfDrops);
          self.firstDropsTrigger = false;
          $drops.textContent = numberOfDrops;
        }
      }
    }
  }

});

function toEmitter(obj) {
  obj.eventHash = {};

  obj.trigger = function() {
    var eventName = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);

    if (obj.eventHash[eventName])
      obj.eventHash[eventName].forEach(function(handler) {
        handler.apply(this, args);
      });
  }

  obj.on = function(eventName, handler) {
    (obj.eventHash[eventName]) ?
    obj.eventHash[eventName].push(handler):
      obj.eventHash[eventName] = [handler];
  }
}
