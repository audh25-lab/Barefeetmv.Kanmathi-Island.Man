/* =========================================================
   BAREFEETMV.KANMATHI — POLICE / ENEMY AI
   Endless Chase Controller (Temple Run–class)
========================================================= */

export class PoliceAI {
  constructor(){
    this.distance = -120;
    this.speed = 0.6;
    this.visible = false;
    this.anger = 0;
    this.cooldown = 0;
  }

  reset(){
    this.distance = -120;
    this.speed = 0.6;
    this.visible = false;
    this.anger = 0;
    this.cooldown = 0;
  }

  enrage(){
    this.anger = Math.min(1, this.anger + 0.4);
    this.cooldown = 180;
    this.visible = true;
  }

  update(playerDistance, invincible){
    if(invincible){
      this.distance -= 4;
      if(this.distance < -200) this.visible = false;
      return;
    }

    if(this.cooldown > 0){
      this.cooldown--;
      this.distance += this.speed * (1 + this.anger);
      this.visible = true;
    } else {
      this.distance -= 1;
      if(this.distance < -120){
        this.visible = false;
        this.anger = Math.max(0, this.anger - 0.01);
      }
    }

    this.distance = Math.min(this.distance, -40);
  }
}