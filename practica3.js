var game = function() {
	

///////////////////////////////Inicio Quintus/////////////////////////////////////////////////
	// Set up an instance of the Quintus engine and include
	// the Sprites, Scenes, Input and 2D module. The 2D module
	// includes the `TileLayer` class as well as the `2d` componet.
	var Q = Quintus({ 
		development: true,
		imagePath: "images/",
		audioPath: "audio/",
		audioSupported: [ 'mp3' ],
		dataPath: "data/"
		}).include("Sprites, Scenes, Input, 2D, Audio, Anim, Touch, UI, TMX").setup({
			width: 320, // Set the default width to 800 pixels
			height: 480, // Set the default height to 600 pixels
		}).controls().touch().enableSound();

	

///////////////////////////////sprites//////////////////////////////////////////////	
	
	//CARGA DE DATOS
	Q.load(["mario_small.png", "mario_small.json",
			"mainTitle.png", "goomba.png", "goomba.json",
			"princess.png", "bloopa.png", "bloopa.json",
			"coin.png", "coin.json", "1up_mushroom.png"], function() {

		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png", "goomba.json");
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png", "coin.json");

	

	//SPRITE MARIO
	Q.Sprite.extend("Mario",{

	 	

		init: function(p) {

		 	this.alive = true;
		 	this.lastMileStone = 1;
		 	this.oneUp = true;
		    this._super(p, {
		      	
		      	sheet: "marioR",
		      	sprite:  "Mario_anim",
		    	jumpSpeed: -400,
		    	speed: 300,
		    	w: 32,
		    	h: 32

		    });

		    this.add('2d, platformerControls, animation, tween');

		    this.on("hit.sprite",function(collision) {
				if(collision.obj.isA("Peach")) {
					Q.audio.play("music_level_complete.mp3");
					Q.stageScene("endGame",1, { label: "You Win!" });
					this.destroy();
				}
			});


		},


		Die: function(){
			if(this.alive){
				this.alive = false;
				Q.audio.stop();
				Q.audio.play("mario-bros-mamma-mia.mp3");
				this.gravity = 0;
				this.stage.unfollow();
				this.play("die");
				this.del('2d, platformerControls');
				Q.state.dec("lives", 1);
				Q.stageScene("endGame",1, { label: "You Died" });
				this.animate({y: this.p.y-100}, 0.4, Q.Easing.Linear, {callback: this.nowDown});
			}

		},

		bounce: function(){

			this.p.vy = -200;
		},

		nowDown: function(){

			this.animate({y: this.p.y+300}, 0.8, Q.Easing.Linear, {callback: this.changeToDead });
				
		},

		changeToDead : function(){
			
			this.destroy();	
			
		},

		fall: function(){

			if(this.alive){
				this.destroy();
				Q.state.dec("lives", 1);
				Q.audio.stop();
				Q.audio.play("mario-bros-mamma-mia.mp3");
				Q.stageScene("endGame",1, { label: "You Died" });
			}
		},

		step: function(dt) {
		  	
		  	if(this.p.y > 520)
		  		this.stage.follow(Q("Mario").first(), {x: true, y: false});

		  	if(this.oneUp && Q.state.get("score") / 1000 == this.lastMileStone){

		  		this.extralife();
		  		this.oneUp = false;
		  	}
		  	else if(!this.oneUp){
		  		this.lastMileStone++;
		  		this.oneUp = true;
		  	}

		  	if(this.p.y > 620){
		  		this.fall();
		  	}
		  	if(!this.alive)
		  		this.play("die");
		    else if(this.p.vy != 0) {
		    	this.play("fall_" + this.p.direction);
		    } 
		  	else if(this.p.vx > 0) {
		    	this.play("run_right");
		    } 
		    else if(this.p.vx < 0) {
		    	this.play("run_left");
		    } 
		    else {
		    	this.play("Stand_" + this.p.direction);
		    }
					
		},
		extralife: function(){

			Q.state.inc("lives", 1);
			Q.audio.play("1up.mp3");
		}
	
	});

	//SPRITE GOOMBA
	Q.Sprite.extend("Goomba",{

	 
		init: function(p) {

		 
		    this._super(p, {
		    	sheet: "goomba",
		    	sprite: "Goomba_anim",
		    	x: 1500,
		    	y: 450,
		    	vx: 100
		    });

		    this.add('2d, aiBounce, animation, DefaultEnemy');


		},


		step: function(dt) {

			if(this.p.vx != 0 && this.alive){
				this.play("run");
			}
		}
		// Listen for a sprite collision, if it's the player,
		// end the game unless the enemy is hit on top
	
	});

	//SPRITE PEACH
	Q.Sprite.extend("Peach",{

	 
		init: function(p) {

		 
		    this._super(p, {
		    	asset: "princess.png",
		    	
		    });
		},

		// Listen for a sprite collision, if it's the player,
		// end the game unless the enemy is hit on top
	
	});
	

	//SPRITE BLOOPA
	Q.Sprite.extend("Bloopa",{

	 
		init: function(p) {

		 
		    this._super(p, {
		    	sheet: "bloopa",
		    	sprite: "Bloopa_anim",
		    	x: 200,
		    	y: 350,
		    	gravity: 1/4

		    });

		    this.add('2d, aiBounce, animation, DefaultEnemy');

			this.on("dead", this, "DEAD");
		},

		step: function(dt) {

			if(this.alive){
				this.play("standing");
				if(this.p.vy == 0)
					this.p.vy =  -300;
			}
			
		}
		// Listen for a sprite collision, if it's the player,
		// end the game unless the enemy is hit on top
	
	});

	//SPRITE COIN 
	Q.Sprite.extend("Coin",{

	 
		init: function(p) {

		 	this.taken = false;
		    this._super(p, {
		    	sheet: "coin",
		    	sprite: "Coin_anim",
		    	sensor: true
		    });

		    this.add('animation, tween');

		    this.on("hit.sprite",function(collision) {
				if(collision.obj.isA("Mario")) {
					if(!this.taken){
						this.taken = true;
						Q.audio.play("coin.mp3");
						this.animate({y: p.y-50}, 0.25, Q.Easing.Linear, {callback: this.destroy});
						Q.state.inc("score", 10);
					}
				}
			});
		},

		step: function(dt) {

			this.play("Shine");
		}
	
	});

	//SPRITE ONEUP
	Q.Sprite.extend("OneUp",{

	 
		init: function(p) {

			this.taken = false;
		 
		    this._super(p, {
		    	asset: "1up_mushroom.png",
		    	x: 2000,
		    	y: 430,
		    	vx: 100,
		    	sensor: true
		    });

		    this.on("hit.sprite",function(collision) {


				if(collision.obj.isA("Mario")) {
					if(!this.taken){
						this.taken = true;
						collision.obj.extralife();
						this.destroy();
					}
				}
			});

		}

	
	});

////////////////////////////////////COMPONENTES////////////////////////////////////////////////////
	//COMPONENTE ENEMIGOS
	Q.component("DefaultEnemy", {
		
		added: function(){

			this.entity.alive = true;
			this.entity.on("bump.left,bump.right,bump.bottom",function(collision) {
				if(collision.obj.isA("Mario")) {
					collision.obj.Die();	
				}
			});

			this.entity.on("bump.top",function(collision, that) {
				if(collision.obj.isA("Mario")) {
					collision.obj.bounce();
					this.DEAD();
				}
			});

			this.entity.on("endAnim", this.entity, "die");

		},

		extend: {
			DEAD: function() {
				if(this.alive){
					Q.audio.play("kill_enemy.mp3");
					this.alive = false;
					Q.state.inc("score", 100);
					this.play("die");
					
				}
			},

			die: function(){
				this.destroy();
			}
		}

	});

	

////////////////////////////////////ANIMACIONES/////////////////////////////////////////////////////
	//Animaciones Mario
	Q.animations('Mario_anim', {
		run_right: { frames: [1,2,3], rate: 1/10}, 
		run_left: { frames: [17,16,15], rate:1/10 },
		Stand_right: { frames: [0]},
		Stand_left: { frames: [14] },
		fall_right: { frames: [4], loop: false },
		fall_left: { frames: [18], loop: false },
		die: {frames: [12], loop: true}
	});

	//Animaciones Bowser
	Q.animations('Bowser_anim', {
		run_right: { frames: [1, 2, 3, 4, 5], rate: 1/10}, 
		run_left: { frames: [10, 9, 8, 7, 6], rate: 1/10 },
		Stand_right: { frames: [0]},
		Stand_left: { frames: [11] },
		fall_right: { frames: [4], loop: false },
		fall_left: { frames: [18], loop: false },
		die: {frames: [12], loop: true}
	});

	//Animaciones Goomba
	Q.animations('Goomba_anim', {
		run: {frames: [0, 1], rate:1/3},
		die: {frames:[2], rate: 1/2, loop:false, trigger: "endAnim"}
	});

	//Animaciones Bloopa
	Q.animations('Bloopa_anim', {
		standing: {frames: [0,1], rate: 1/2},
		die: {frames: [2], rate: 1/2, loop:false, trigger: "endAnim"}
	});

	//Animaciones Coin
	Q.animations('Coin_anim', {
		Shine: {frames:[0,1,2], rate: 1/3, loop: true}
	})

///////////////////////////////////AUDIOS///////////////////////////////////////////////////////////
	//CARGA DE AUDIOS
	Q.load(["music_die.mp3", "music_level_complete.mp3", "music_main.mp3",
	 "coin.mp3", "mario-bros-mamma-mia.mp3", "squish_enemy.mp3", "kill_enemy.mp3", "1up.mp3"], function(){

	});
///////////////////////////////////CARGA NIVELES////////////////////////////////////////////////////

	//INICIALIZACION
	Q.loadTMX("final.tmx", function() {
		Q.stageScene("mainTitle");
	});


	//NIVEL 1
	Q.scene("level1", function(stage) {

		Q.stageTMX("final.tmx",stage);

		Q.audio.play('music_main.mp3',{ loop: true });

		var player = stage.insert(new Q.Mario({x: 150,y: 380,}));
		
		stage.insert(new Q.Goomba({x: 1460,y: 350}));
		stage.insert(new Q.Goomba({x: 1475,y: 340}));

		stage.insert(new Q.Peach({x: 2000,y: 517}));

		stage.insert(new Q.Bloopa({x:752,y:420}));
		stage.insert(new Q.Bloopa({x:652,y:420}));
	
		stage.insert(new Q.OneUp({x: 26,y: 528}));

		stage.insert(new Q.Coin({x:500,y:464}));
		stage.insert(new Q.Coin({x:532,y:464}));
		stage.insert(new Q.Coin({x:500,y:432}));
		stage.insert(new Q.Coin({x:532,y:432}));

		stage.add("viewport").follow(Q("Mario").first());
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 160;
	});

	//TITULO DEL JUEGO
	Q.scene("mainTitle", function(stage){

		var button = new Q.UI.Button({
			x: Q.width/2, 
			y: Q.height/2,
			asset:"mainTitle.png"
		});
		stage.insert(button);
		button.on("click",function() {
			Q.clearStages();
			Q.state.reset({ score: 0, lives: 2 });
			Q.stageScene("level1");
			Q.stageScene("hud", 3);
		});

	});

	//GAME OVER
	Q.scene('endGame',function(stage) {

		Q.audio.stop("music_main.mp3");	
		var container = stage.insert(new Q.UI.Container({
		
			x: Q.width/2, 
			y: Q.height/2,
			fill: "rgba(0,0,0,0.5)"
		
		}));
		var button = container.insert(new Q.UI.Button({ 
		
			x: 0,
			y: 0, 
			fill: "#CCCCCC",
			label: (Q.state.get("lives") > 0 ? "Play Again" : "GAME OVER")
		
		}))
		var label = container.insert(new Q.UI.Text({
			y: -10 - button.p.h,
			label: stage.options.label 
		}));
		// When the button is clicked, clear all the stages
		// and restart the game.
		
		button.on("click",function() {
			Q.clearStages();
			if( Q.state.get("lives") > 0){
				Q.stageScene('level1');
				Q.stageScene("hud", 3);
			}
			else
				Q.stageScene('mainTitle');
		});
		// Expand the container to visibily fit it's contents
		// (with a padding of 20 pixels)
		container.fit(20);
	});
});
	//HUD
    Q.scene("hud", function(stage) {
        /** Primero, voy a crear un "Container" que contendrá los labels. */
        var container = stage.insert(new Q.UI.Container({
            x: Q.width/3,
            y: Q.height/6,
            w: Q.width,
            h: 50,
            radius: 0
        }));
 
        /** Ahora voy a insertar los tres labels uno encima de otro. */
        container.insert(new Q.SCORE({
            x: container.p.x/2 - container.p.x,
            y: -container.p.y/3
        }));

        container.insert(new Q.LIVES({
            x: container.p.x/2 + container.p.x,
            y: -container.p.y/3
        }));

    });

/////////////////////////////////PARTES DEL HUD////////////////////////////////////////////////
    //SCORE
    Q.UI.Text.extend("SCORE", {
        init: function(p) {
            this._super(p, {
                label: "SCORE: " + Q.state.get("score"),
                    color: "white",
                    size: "14"
                });
            /** Necesito extender porque quiero escuchar los cambios de la variable en el "State". */
            Q.state.on("change.score", this, "update_label");
        },
 
        /**
        * Con esta función actualizo el label.
        */
        update_label: function(score) {
            this.p.label = "SCORE: " +  Q.state.get("score");
        }
    });

    //LIVES
    Q.UI.Text.extend("LIVES", {
        init: function(p) {
            this._super(p, {
                label: "LIVES: " + Q.state.get("lives"),
                    color: "white",
                    size: "14"
                });
            /** Necesito extender porque quiero escuchar los cambios de la variable en el "State". */
            Q.state.on("change.lives", this, "update_label");
        },
 
        /**
        * Con esta función actualizo el label.
        */
        update_label: function(score) {
            this.p.label = "LIVES: " + Q.state.get("lives");
        }
    });
}