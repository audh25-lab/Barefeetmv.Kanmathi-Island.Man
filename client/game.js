/* =========================================================
   BAREFEETMV.KANMATHI — CORE GAME LOGIC
   Endless Runner Engine (Subway Surfers–class)
========================================================= */

import { Renderer } from "./renderer.js";
import { PoliceAI } from "./ai.js";
import { AudioSystem } from "./audio.js";
import { Save } from "./save.js";
import { Levels } from "./levels.js";

export const Game = {
  state: "menu",
  speed: 9,
  distance: 0,
  score: 0,
  coins: 0,
  lives: 3,
  multiplier: 1,
  time: 0,
  player: {
    lane: 1,
    y: 0,
    jump: 0,
    slide: 0,
    inv: 0
  },
  entities: [],
  powerups: [],
  police: null,

  init(canvas){
    this.renderer = new Renderer(canvas);
    this.audio = new AudioSystem();
    this.save = Save.load();
    this.levels = new Levels();
    this.bindInput();
    this.reset();
  },

  reset(){
    this.speed = 9;
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.multiplier = 1;
    this.entities.length = 0;
    this.powerups.length = 0;
    this.police = new PoliceAI();
    this.player.lane = 1;
    this.player.inv = 0;
    this.state = "run";
    this.audio.playMusic();
  },

  bindInput(){
    let sx = 0, sy = 0;
    addEventListener("touchstart", e=>{
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    });
    addEventListener("touchend", e=>{
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if(Math.abs(dx)>Math.abs(dy)){
        if(dx>30) this.moveRight();
        if(dx<-30) this.moveLeft();
      }else{
        if(dy<-30) this.jump();
        if(dy>30) this.slide();
      }
    });
    addEventListener("keydown", e=>{
      if(e.key==="ArrowLeft")this.moveLeft();
      if(e.key==="ArrowRight")this.moveRight();
      if(e.key==="ArrowUp")this.jump();
      if(e.key==="ArrowDown")this.slide();
    });
  },

  moveLeft(){ this.player.lane = Math.max(0,this.player.lane-1); },
  moveRight(){ this.player.lane = Math.min(2,this.player.lane+1); },

  jump(){
    if(this.player.jump<=0){
      this.player.jump = 22;
      navigator.vibrate?.(20);
      this.audio.jump();
    }
  },

  slide(){
    if(this.player.slide<=0){
      this.player.slide = 18;
      this.audio.slide();
    }
  },

  spawn(){
    const pack = this.levels.next();
    pack.obstacles.forEach(o=>this.entities.push(o));
    pack.coins.forEach(c=>this.entities.push(c));
    if(pack.power) this.powerups.push(pack.power);
  },

  hit(){
    if(this.player.inv>0) return;
    this.lives--;
    this.player.inv = 120;
    this.police.enrage();
    this.audio.hit();
    navigator.vibrate?.(60);
    if(this.lives<=0) this.gameOver();
  },

  gameOver(){
    this.state="over";
    this.audio.stopMusic();
    Save.commit({
      highScore:Math.max(this.save.highScore,this.score),
      coins:this.save.coins+this.coins
    });
  },

  update(dt){
    if(this.state!=="run") return;

    this.time+=dt;
    this.speed+=dt*0.0008;
    this.distance+=this.speed*dt*0.01;
    this.score+=dt*0.02*this.multiplier;

    if(Math.random()<0.02) this.spawn();

    if(this.player.jump>0) this.player.jump--;
    if(this.player.slide>0) this.player.slide--;
    if(this.player.inv>0) this.player.inv--;

    this.entities.forEach(e=>{
      e.z+=this.speed;
      if(e.lane===this.player.lane){
        if(e.type==="coin" && e.z>0 && e.z<40){
          this.coins++; e.dead=true;
          this.audio.coin();
        }
        if(e.type==="obstacle" && e.z>0 && e.z<40){
          if(this.player.jump<=0 && this.player.slide<=0)
            this.hit();
        }
      }
    });

    this.entities=this.entities.filter(e=>!e.dead && e.z<200);
    this.police.update(this.distance,this.player.inv>0);

    this.renderer.render(this);
  }
};