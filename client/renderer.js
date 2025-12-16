/* =========================================================
   BAREFEETMV.KANMATHI — RENDERER
   Juicy 2.5D Runner Renderer (Parallax + FX)
========================================================= */

export class Renderer {
  constructor(canvas){
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
    addEventListener("resize",()=>this.resize());
    this.shake = 0;
    this.day = 0;
  }

  resize(){
    this.w = this.c.width = innerWidth * devicePixelRatio;
    this.h = this.c.height = innerHeight * devicePixelRatio;
    this.ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  }

  render(game){
    const ctx=this.ctx;
    this.day += 0.0001;

    const shakeX = (Math.random()-.5)*this.shake;
    const shakeY = (Math.random()-.5)*this.shake;
    this.shake*=0.9;

    ctx.save();
    ctx.translate(shakeX,shakeY);

    /* SKY */
    const grad = ctx.createLinearGradient(0,0,0,this.h);
    grad.addColorStop(0,`hsl(${200+Math.sin(this.day)*20},70%,40%)`);
    grad.addColorStop(1,"#021");
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,this.w,this.h);

    /* OCEAN PARALLAX */
    for(let i=0;i<40;i++){
      ctx.fillStyle="rgba(0,180,220,.15)";
      ctx.fillRect((i*120+(game.time*0.05)%120),0,3,this.h);
    }

    /* LANES */
    ctx.strokeStyle="rgba(255,255,255,.05)";
    for(let i=1;i<3;i++){
      ctx.beginPath();
      ctx.moveTo(this.w/3*i,0);
      ctx.lineTo(this.w/3*i,this.h);
      ctx.stroke();
    }

    /* ENTITIES */
    game.entities.forEach(e=>{
      const x = this.laneX(e.lane);
      const y = this.h - e.z*2;
      if(e.type==="coin"){
        ctx.fillStyle="#fd0";
        ctx.beginPath();
        ctx.arc(x,y,10,0,Math.PI*2);
        ctx.fill();
      }else{
        ctx.fillStyle="#f33";
        ctx.fillRect(x-20,y-20,40,40);
      }
    });

    /* PLAYER */
    const px=this.laneX(game.player.lane);
    const py=this.h*0.75 - game.player.jump*4;
    ctx.fillStyle=game.player.inv>0?"#ff0":"#0f0";
    ctx.beginPath();
    ctx.arc(px,py,22,0,Math.PI*2);
    ctx.fill();

    /* POLICE */
    if(game.police.visible){
      ctx.fillStyle="#09f";
      ctx.beginPath();
      ctx.arc(px,py+60,20,0,Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  }

  laneX(lane){
    return (this.w/3)*(lane+0.5);
  }
}