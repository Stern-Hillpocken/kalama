import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { Tower } from '../models/tower.model';
import { Building } from '../models/building.model';
import { Character } from '../models/character.model';
import { Enemy } from '../models/enemy.model';
import { Router } from '@angular/router';
import { Resource } from '../models/resource.model';
import { MapState } from '../models/map-state.model';
import { InformationOf } from './information-of.service';
import { Relic } from '../models/relic.model';
import { Power } from '../models/power.model';
import { BubbleService } from './bubble.service';
import { Bubble } from '../models/bubble.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly _gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(new GameState("", "", 0, "", new MapState(1,0,0,0,0,0), [-1,-1], false, 0, 0, 0, 0, 0, new Power("","","",0), 0, [], [], [], [], [], [], [], 0, [], [[],[],[],[],[],[]]));

  private sacrificeResourceGain = {gem: 3, stone: 4, wood: 6};
  private repairResourceCost = {stone: 6, wood: 8};

  private delayBetweenPhases: number = 1000;

  constructor(
    private router: Router,
    private informationOf: InformationOf,
    private bubbleService: BubbleService
  ) { }

  _getGameState$(): Observable<GameState> {
    return this._gameState$.asObservable();
  }

  _setGameState$(state: GameState): void {
    this._gameState$.next(state);
  }

  launchTuto(): void {
    this._setGameState$(new GameState("battle", "", 0, "preparation", new MapState(1,0,0,0,0,0), [-1,-1], false, 15, 0, 3, 2, 0, this.informationOf.getPowerWithName("dash"), 3, [], [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], [], ["ram","ram","wall"], ["ram","ram","wall"], 0, ["","","","","worm","","worm"], [["","","","","",""],["","","","","",""],["",new Resource("wood", "Arbre", "wood", 1, "Du bois à récolter", "resource"),"","","",""],["","","","","",""],["","","","",new Resource("stone", "Roche", "stone", 2, "De la pierre à exploiter", "resource"),""],["","","","","",""]]));
  }

  sleep(milliseconds: number) {
    let resolve: { (value: unknown): void; };
    let promise = new Promise((_resolve) => resolve = _resolve);
    setTimeout(() => resolve(undefined), milliseconds);
    return promise;
  }

  timeFor(phase: "buildings production" | "towers trigger" | "move enemies" | "spawn"): number {
    let needToBeDisplayed:boolean = false;
    let newGameState: GameState = this._gameState$.getValue();
    if (phase === "spawn") {
      if (newGameState.spawnStrip[newGameState.wave] !== "") return this.delayBetweenPhases/2;
      else return 0;
    }
    for (let r = 0; r < newGameState.grid.length; r++) {
      for (let c = 0; c < newGameState.grid[r].length; c++) {
        if (
          newGameState.grid[r][c].type &&
          ((phase === "buildings production" && newGameState.grid[r][c].type === "building") ||
          (phase === "towers trigger" && newGameState.grid[r][c].type === "tower") ||
          (phase === "move enemies" && newGameState.grid[r][c].type === "enemy"))
          ) {
            needToBeDisplayed = true;
            break;
          }
      }
    }
    return needToBeDisplayed ? this.delayBetweenPhases : 0;
  }

  endTurn(): void {
    this.sleep(0)
      .then(() => this.upkeep())
      .then(() => this.sleep(this.delayBetweenPhases/2)) 
      .then(() => this.buildingsProduction())
      .then(() => this.sleep(this.timeFor("buildings production"))) 
      .then(() => this.towersTrigger())
      .then(() => this.sleep(this.timeFor("towers trigger")))
      .then(() => this.moveEnemies())
      .then(() => this.sleep(this.timeFor("move enemies")))
      .then(() => this.spawn())
      .then(() => this.sleep(this.timeFor("spawn")))
      .then(() => this.checkEndBattle());
  }

  upkeep(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.status = "upkeep";

    newGameState.wave ++;
    if (newGameState.koCounter > 0) newGameState.koCounter --;
    if (newGameState.currentPowerCoolDown < newGameState.power.maxPowerCoolDown) newGameState.currentPowerCoolDown ++;
    //this._setGameState$(newGameState);
  }

  buildingsProduction(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.status = "buildings";

    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "building"){
          let building : Building = newGameState.grid[r][c];

          if (building.name === "wood-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "wood") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "wood"))){
            let relicBoost: number = 0;
            newGameState.relics.forEach(relic => {
              if (relic.name === "wood-extractor") {
                let rand: number = this.random(1,100);
                if (rand <= relic.quantity*10) relicBoost ++;
              }
            });
            newGameState.wood += building.efficiency + relicBoost;
            let cStart: number = c;
            if (newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name === "wood") cStart = c-1;
            else cStart = c+1;
            this.bubbleService.addBubble(new Bubble(
              "wood",
              building.efficiency + relicBoost,
              this.getCoordinateFromRowColumn("w", r, c),
              this.getCoordinateFromRowColumn("x", r, cStart),
              this.getCoordinateFromRowColumn("y", r, cStart),
              this.getCoordinateFromRowColumn("x", r, c),
              this.getCoordinateFromRowColumn("y", r, c),
              "positive"
              ));
          } else if (building.name === "stone-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "stone") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "stone"))){
            let relicBoost: number = 0;
            newGameState.relics.forEach(relic => {
              if (relic.name === "stone-extractor") {
                let rand: number = this.random(1,100);
                if (rand <= relic.quantity*10) relicBoost ++;
              }
            });
            newGameState.stone += building.efficiency + relicBoost;
            let cStart: number = c;
            if (newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name === "stone") cStart = c-1;
            else cStart = c+1;
            this.bubbleService.addBubble(new Bubble(
              "stone",
              building.efficiency + relicBoost,
              this.getCoordinateFromRowColumn("w", r, c),
              this.getCoordinateFromRowColumn("x", r, cStart),
              this.getCoordinateFromRowColumn("y", r, cStart),
              this.getCoordinateFromRowColumn("x", r, c),
              this.getCoordinateFromRowColumn("y", r, c),
              "positive"
              ));
          }

        }
      }
    }
  }

  towersTrigger(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.status = "towers";

    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "tower"){
          let tower: Tower = newGameState.grid[r][c];

          // trigger
          if (tower.sequence[tower.step] === "attack"){
            if (tower.tileTargeted.includes("top") && r !== 0 && newGameState.grid[r-1][c].type && newGameState.grid[r-1][c] && newGameState.grid[r-1][c].type === "enemy"){
              // Damage
              newGameState.grid[r-1][c].life -= tower.damage;
              this.bubbleService.addBubble(new Bubble(
                "attack"+this.compassRose(r, c, r-1, c),
                tower.damage,
                this.getCoordinateFromRowColumn("w", r, c),
                this.getCoordinateFromRowColumn("x", r, c),
                this.getCoordinateFromRowColumn("y", r, c),
                this.getCoordinateFromRowColumn("x", r-1, c),
                this.getCoordinateFromRowColumn("y", r-1, c),
                "positive"
                ));
              if (newGameState.grid[r-1][c].name === "hedgehog") {
                setTimeout(() => this.enemyAttackFromTo(r-1, c, r, c), this.delayBetweenPhases/2);
              }
              if (newGameState.grid[r-1][c].life <= 0) {
                setTimeout(() => {
                  this.enemyDeathFromTo(r, c, r-1, c);
                }, this.delayBetweenPhases);
              }
            }
          }
          // add step
          tower.step ++;
          if (tower.step >= tower.sequence.length) tower.step = 0;
          // change visual
          if(tower.sequence[tower.step] === "attack") tower.image = tower.name + "-engaged";
          else tower.image = tower.name;

        }
      }
    }
    this._setGameState$(newGameState);
  }

  enemyDeathFromTo(r: number, c: number, rEnemy: number, cEnemy: number): void {
    let newGameState: GameState = this._gameState$.getValue();
    let gemGain: number = 1;
    newGameState.relics.forEach(relic => {
      if (relic.name === "gem-extractor") {
        let rand: number = this.random(1,100);
        if (rand <= relic.quantity*5) gemGain ++;
      }
    });
    newGameState.gem += gemGain;
    this.bubbleService.addBubble(new Bubble(
      "gem",
      gemGain,
      this.getCoordinateFromRowColumn("w", r, c),
      this.getCoordinateFromRowColumn("x", rEnemy, cEnemy),
      this.getCoordinateFromRowColumn("y", rEnemy, cEnemy),
      this.getCoordinateFromRowColumn("x", r, c),
      this.getCoordinateFromRowColumn("y", r, c),
      "positive"
    ));
    if (newGameState.grid[rEnemy][cEnemy].name === "frog") {
      // Explosion
      if (rEnemy-1 >= 0 && cEnemy-1 >= 0) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy-1, cEnemy-1);
      if (rEnemy-1 >= 0) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy-1, cEnemy);
      if (rEnemy-1 >= 0 && cEnemy+1 < newGameState.grid[rEnemy].length) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy-1, cEnemy+1);
      if (cEnemy-1 >= 0) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy, cEnemy-1);
      if (cEnemy+1 < newGameState.grid[rEnemy].length) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy, cEnemy+1);
      if (rEnemy+1 < newGameState.grid.length && cEnemy-1 >= 0) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy+1, cEnemy-1);
      if (rEnemy+1 < newGameState.grid.length) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy+1, cEnemy);
      if (rEnemy+1 < newGameState.grid.length && cEnemy+1 < newGameState.grid[rEnemy].length) this.explosionFromEnemyTo(rEnemy, cEnemy, rEnemy+1, cEnemy+1);
    }
    newGameState.grid[rEnemy][cEnemy] = "";
    this._setGameState$(newGameState);
  }

  explosionFromEnemyTo(rEnemy: number, cEnemy: number, rFinal: number, cFinal: number): void {
    let newGameState: GameState = this._gameState$.getValue();
    this.bubbleService.addBubble(new Bubble(
      "attack"+this.compassRose(rEnemy, cEnemy, rFinal, cFinal),
      1,
      this.getCoordinateFromRowColumn("w", rEnemy, cEnemy),
      this.getCoordinateFromRowColumn("x", rEnemy, cEnemy),
      this.getCoordinateFromRowColumn("y", rEnemy, cEnemy),
      this.getCoordinateFromRowColumn("x", rFinal, cFinal),
      this.getCoordinateFromRowColumn("y", rFinal, cFinal),
      "negative"
    ));
    if (newGameState.grid[rFinal][cFinal].life) this.enemyAttackFromTo(rEnemy, cEnemy, rFinal, cFinal);
    this._setGameState$(newGameState);
  }

  moveEnemies(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.status = "enemies";

    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        // For each cell
        if (newGameState.grid[r][c].moves && newGameState.grid[r][c].activeWave < newGameState.wave){
          if (newGameState.grid[r][c].moves[newGameState.grid[r][c].currentMoveStep] === "down"){
            if (r+1 >= newGameState.grid.length) {
              newGameState.structure -= newGameState.grid[r][c].damage;
              newGameState.grid[r][c] = "";
            } else if (newGameState.grid[r+1][c] === ""){
              newGameState.grid[r+1][c] = newGameState.grid[r][c];
              newGameState.grid[r+1][c] = this.enemyPreparationForNextTurn(newGameState.grid[r+1][c], r+1, c);
              newGameState.grid[r][c] = "";
            } else if (newGameState.grid[r][c].name === "grasshopper") {
              let rLanding: number = -1;
              for (let ri = r+1; ri < newGameState.grid.length; ri++) {
                if (newGameState.grid[ri][c] === ""){
                  rLanding = ri;
                  break;
                }
              }
              if (rLanding === -1) {
                newGameState.structure -= newGameState.grid[r][c].damage;
                newGameState.grid[r][c] = "";
              } else {
                newGameState.grid[rLanding][c] = newGameState.grid[r][c];
                newGameState.grid[rLanding][c] = this.enemyPreparationForNextTurn(newGameState.grid[rLanding][c], rLanding, c);
                newGameState.grid[r][c] = "";
              }
            } else if (newGameState.grid[r+1][c].type !== "enemy"){
              this.enemyAttackFromTo(r, c, r+1, c);
            }
          } else if(newGameState.grid[r][c].moves[newGameState.grid[r][c].currentMoveStep] === "left") {
            if (c === 0 || (newGameState.grid[r][c-1].type && newGameState.grid[r][c-1].type === "enemy")) {
              newGameState.grid[r][c] = this.enemyPreparationForNextTurn(newGameState.grid[r][c], r, c);
            } else {
              if (newGameState.grid[r][c-1] === "") {
                newGameState.grid[r][c-1] = newGameState.grid[r][c];
                newGameState.grid[r][c-1] = this.enemyPreparationForNextTurn(newGameState.grid[r][c-1], r, c-1);
                newGameState.grid[r][c] = "";
              } else {
                this.enemyAttackFromTo(r, c, r, c-1);
              }
            }
          } else if(newGameState.grid[r][c].moves[newGameState.grid[r][c].currentMoveStep] === "right") {
            if (c+1 === newGameState.grid[r].length || (newGameState.grid[r][c+1].type && newGameState.grid[r][c+1].type === "enemy")) {
              newGameState.grid[r][c] = this.enemyPreparationForNextTurn(newGameState.grid[r][c], r, c);
            } else {
              if (newGameState.grid[r][c+1] === "") {
                newGameState.grid[r][c+1] = newGameState.grid[r][c];
                newGameState.grid[r][c+1] = this.enemyPreparationForNextTurn(newGameState.grid[r][c+1], r, c+1);
                newGameState.grid[r][c] = "";
              } else {
                this.enemyAttackFromTo(r, c, r, c+1);
              }
            }
          } else if (newGameState.grid[r][c].moves[newGameState.grid[r][c].currentMoveStep] === "teleportation") {
            if (r+1 >= newGameState.grid.length) {
              newGameState.structure -= newGameState.grid[r][c].damage;
              newGameState.grid[r][c] = "";
            } else if (newGameState.grid[r+1][c].life && newGameState.grid[r+1][c].type !== "enemy") {
              this.enemyAttackFromTo(r, c, r+1, c);
            } else {
              let spotChoice: number[] = [];
              for (let ci = 0; ci < newGameState.grid[r+1].length; ci++) {
                if (newGameState.grid[r+1][ci] === "") spotChoice.push(ci);
              }
              if (spotChoice.length > 0) {
                let randomSpot: number = this.random(0, spotChoice.length-1);
                newGameState.grid[r+1][spotChoice[randomSpot]] = newGameState.grid[r][c];
                newGameState.grid[r+1][spotChoice[randomSpot]] = this.enemyPreparationForNextTurn(newGameState.grid[r+1][spotChoice[randomSpot]], r+1, spotChoice[randomSpot]);
                newGameState.grid[r][c] = "";
              }
            }
          }
        }

      }
    }
    this._setGameState$(newGameState);
  }

  enemyAttackFromTo(r: number, c: number, rTarget: number, cTarget: number): void {
    let newGameState: GameState = this._gameState$.getValue();

    newGameState.grid[rTarget][cTarget].life -= newGameState.grid[r][c].damage;
    this.bubbleService.addBubble(new Bubble(
      "attack"+this.compassRose(r, c, rTarget, cTarget),
      newGameState.grid[r][c].damage,
      this.getCoordinateFromRowColumn("w", r, c),
      this.getCoordinateFromRowColumn("x", r, c),
      this.getCoordinateFromRowColumn("y", r, c),
      this.getCoordinateFromRowColumn("x", rTarget, cTarget),
      this.getCoordinateFromRowColumn("y", rTarget, cTarget),
      "negative"
    ));
    if (newGameState.grid[rTarget][cTarget].life <= 0){
      if (newGameState.grid[rTarget][cTarget].type === "character") {
        newGameState.koCounter = newGameState.power.maxPowerCoolDown;
        newGameState.characterPosition = [-1,-1];
      }
      setTimeout(() => {
        newGameState.grid[rTarget][cTarget] = "";
      }, this.delayBetweenPhases);
    }
    newGameState.grid[r][c] = this.enemyPreparationForNextTurn(newGameState.grid[r][c], r, c);

    this._setGameState$(newGameState);
  }

  enemyPreparationForNextTurn(gsCell: any, row: number, column: number): any {
    gsCell.currentMoveStep ++;
    if (gsCell.currentMoveStep >= gsCell.moves.length) gsCell.currentMoveStep = 0;
    if ((column === 0 && gsCell.moves[gsCell.currentMoveStep] === "left") || (column+1 === this._gameState$.getValue().grid.length && gsCell.moves[gsCell.currentMoveStep] === "right")) gsCell.currentMoveStep ++;
    if (gsCell.currentMoveStep >= gsCell.moves.length) gsCell.currentMoveStep = 0;
    gsCell.image = gsCell.name + "-" + gsCell.moves[gsCell.currentMoveStep];
    if (gsCell.name === "mole" &&
      (row+1 === this._gameState$.getValue().grid.length ||
      (row+1 < this._gameState$.getValue().grid.length && this._gameState$.getValue().grid[row+1][column] !== "" && this._gameState$.getValue().grid[row+1][column].type !== "enemy" && this._gameState$.getValue().grid[row+1][column].life > gsCell.damage))
    ) gsCell.image = gsCell.name + "-down";
    gsCell.activeWave ++;
    return gsCell;
  }

  random(min: number, max: number): number{
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  spawn(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.status = "spawn";

    if (newGameState.wave >= newGameState.spawnStrip.length || newGameState.spawnStrip[newGameState.wave] === "") return;

    let emptySpaces: number[] = [];
    let rowToSpawn: number = 0;

    for (let i = 0; i < newGameState.grid[0].length; i++){
      if(newGameState.grid[0][i] === "") emptySpaces.push(i);
    }
    if (emptySpaces.length === 0) {
      rowToSpawn = 1;
      for (let i = 0; i < newGameState.grid[1].length; i++){
        if(newGameState.grid[1][i] === "") emptySpaces.push(i);
      }
    }

    let randomSpotChoosed = emptySpaces[this.random(0, emptySpaces.length-1)];

    let newEnemy: Enemy = this.informationOf.getWithNameType(newGameState.spawnStrip[newGameState.wave], "enemy");
    if (newGameState.difficulty === 2) newEnemy.life = Math.ceil(newEnemy.life * 1.5);
    if (newEnemy.name === "mole" && newGameState.grid[rowToSpawn+1][randomSpotChoosed].type && newGameState.grid[rowToSpawn+1][randomSpotChoosed].type !== "enemy") {
      newEnemy.image = newEnemy.name+"-down";
    } else {
      newEnemy.image = newEnemy.name+"-"+newEnemy.moves[0];
    }
    if (newGameState.displaySubtype === "elite" || newGameState.displaySubtype === "boss") newEnemy.life ++;
    newGameState.grid[rowToSpawn][randomSpotChoosed] = new Enemy(newEnemy.name, newEnemy.title, newEnemy.image, newEnemy.life, newEnemy.currentMoveStep, newEnemy.moves, newEnemy.activeWave, newEnemy.damage, newEnemy.description, "enemy");
    newGameState.grid[rowToSpawn][randomSpotChoosed].activeWave = newGameState.wave;
    this._setGameState$(newGameState);
  }

  placeConstruction(name: string, position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.status !== "preparation" && newGameState.status !== "player") return;
    if (newGameState.grid[position[0]][position[1]] !== "") return;

    if (name === "character" && newGameState.koCounter === 0) {
      newGameState.grid[position[0]][position[1]] = new Character("character", "Votre personnage", "character", 2, 1, "C'est vous !", "character");
      newGameState.characterPosition = [position[0],position[1]];
      return;
    }

    for (let i = 0; i < newGameState.buildingsAvailable.length; i++){
      if (newGameState.buildingsAvailable[i] === name){
        newGameState.buildingsAvailable.splice(i,1);
        let newBuilding: Building = this.informationOf.getWithNameType(name, "building");
        newGameState.relics.forEach(relic => {
          if (relic.name === "reinforced-"+name) newBuilding.life += relic.quantity;
        });
        newGameState.grid[position[0]][position[1]] = new Building(newBuilding.name, newBuilding.title, newBuilding.image, newBuilding.life, newBuilding.efficiency, newBuilding.description, newBuilding.gemCost, newBuilding.stoneCost, newBuilding.woodCost, "building");
        return;
      }
    }

    for (let i = 0; i < newGameState.towersAvailable.length; i++){
      if (newGameState.towersAvailable[i] === name){
        if (this.isDiagonallyNearByCharacter(position)){
          newGameState.towersAvailable.splice(i,1);
          let newTower: Tower = this.informationOf.getWithNameType(name, "tower");
          newGameState.relics.forEach(relic => {
            if (relic.name === "reinforced-"+name) newTower.life += relic.quantity;
          });
          newGameState.grid[position[0]][position[1]] = new Tower(newTower.name, newTower.title, newTower.image, newTower.life, newTower.damage, newTower.sequence, newTower.step, newTower.tileTargeted, newTower.description, newTower.gemCost, newTower.stoneCost, newTower.woodCost, "tower");
          this.endTurn();
          return;
        }
      }
    }
  }

  isDiagonallyNearByCharacter(position: number[]): boolean {
    let charPos: number[] = this._gameState$.getValue().characterPosition;
    if (Math.abs(position[0] - charPos[0]) <= 1 && Math.abs(position[1] - charPos[1]) <= 1) return true;
    return false;
  }

  moveCharacter(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.status !== "player") return;

    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].name && newGameState.grid[r][c].name === "character"){
          if (newGameState.grid[position[0]][position[1]] === ""){
            newGameState.grid[position[0]][position[1]] = newGameState.grid[r][c];
            newGameState.characterPosition = [position[0],position[1]];
            newGameState.grid[r][c] = "";
          } else if (newGameState.grid[position[0]][position[1]].type && newGameState.grid[position[0]][position[1]].type === "enemy") {
            // Damage
            newGameState.grid[position[0]][position[1]].life -= newGameState.grid[r][c].damage;
            this.bubbleService.addBubble(new Bubble(
              "attack"+this.compassRose(r, c, position[0], position[1]),
              newGameState.grid[r][c].damage,
              this.getCoordinateFromRowColumn("w", r, c),
              this.getCoordinateFromRowColumn("x", r, c),
              this.getCoordinateFromRowColumn("y", r, c),
              this.getCoordinateFromRowColumn("x", position[0], position[1]),
              this.getCoordinateFromRowColumn("y", position[0], position[1]),
              "positive"
            ));
            if (newGameState.grid[position[0]][position[1]].name === "hedgehog") {
              setTimeout(() => this.enemyAttackFromTo(position[0], position[1], r, c), this.delayBetweenPhases/2);
            }
            if (newGameState.grid[position[0]][position[1]].life <= 0) {
              this.enemyDeathFromTo(r, c, position[0], position[1]);
            }
          }
          this.endTurn();
          return;
        }
      }
    }
    this._setGameState$(newGameState);
  }

  compassRose(rStart: number, cStart: number, rEnd: number, cEnd: number): string {
    let name: string = "";
    if (rEnd < rStart && cEnd < cStart) name = "-top-left";
    else if (rEnd < rStart && cEnd === cStart) name = "-top";
    else if (rEnd < rStart && cEnd > cStart) name = "-top-right";
    else if (rEnd === rStart && cEnd < cStart) name = "-left";
    else if (rEnd === rStart && cEnd > cStart) name = "-right";
    else if (rEnd > rStart && cEnd < cStart) name = "-bottom-left";
    else if (rEnd > rStart && cEnd === cStart) name = "-bottom";
    else if (rEnd > rStart && cEnd > cStart) name = "-bottom-right";
    return name;
  }

  checkEndBattle(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.status = "player";
    this._setGameState$(newGameState);

    if (newGameState.wave < newGameState.spawnStrip.length) return;
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "enemy") return;
      }
    }
    
    this.bubbleService.reset();
    // End of tuto
    if (newGameState.difficulty < 1) this.router.navigateByUrl("");
  }

  powerDash(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.status !== "player") return;
    if (newGameState.currentPowerCoolDown < newGameState.power.maxPowerCoolDown) return;

    if (newGameState.grid[position[0]][position[1]] === ""){
      newGameState.grid[position[0]][position[1]] = newGameState.grid[newGameState.characterPosition[0]][newGameState.characterPosition[1]];
      newGameState.grid[newGameState.characterPosition[0]][newGameState.characterPosition[1]] = "";
      newGameState.characterPosition = [position[0],position[1]];
      newGameState.currentPowerCoolDown = -1;
      this.endTurn();
    }
  }

  powerTowerReload() {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.status !== "player") return;
    if (newGameState.currentPowerCoolDown < newGameState.power.maxPowerCoolDown) return;

    for (let r = 0; r < newGameState.grid.length; r++) {
      for (let c = 0; c < newGameState.grid[r].length; c++) {
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "tower") newGameState.grid[r][c].step = 0;
      }
    }
    newGameState.currentPowerCoolDown = -1;
    this.endTurn();
  }

  isPositionExistIn(position: number[], array: number[][]): boolean {
    for (let i = 0; i < array.length; i++) {
      if (position[0] === array[i][0] && position[1] === array[i][1]) return true;
    }
    return false;
  }

  generateBattle(type: "boss" | "battle" | "elite"): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.displaySubtype = type;
    newGameState.characterPosition = [-1,-1];
    newGameState.status = "preparation";
    newGameState.koCounter = 0;
    newGameState.currentPowerCoolDown = newGameState.power.maxPowerCoolDown;
    // Decrease event count
    if (type === "battle") newGameState.mapState.battleCount --;
    else if (type === "elite") newGameState.mapState.eliteCount --;
    else if (type === "boss") newGameState.mapState.bossCount --;
    // Building preparation
    newGameState.buildingsAvailable = [];
    for (let i = 0; i < newGameState.buildingsUnlocked.length; i++) {
      newGameState.buildingsAvailable.push(newGameState.buildingsUnlocked[i]);
    }
    // Tower preparation
    newGameState.towersAvailable = [];
    for (let i = 0; i < newGameState.towersUnlocked.length; i++) {
      newGameState.towersAvailable.push(newGameState.towersUnlocked[i]);
    }

    // Map generation
    newGameState.grid = [];
    let mapHeight: number = 6;
    let mapWidth: number = 6;
    // Wood and stone
    let resourceCount = this.random(3,5);
    if (type === 'elite') resourceCount = 2;
    else if (type === 'boss') resourceCount = 0;
    let resourcePosition: number[][] = [];
    let resourceName: string[] = [];
    while (resourceName.length < resourceCount) {
      // Position
      let randomResourcePosition: number[] = [this.random(1,mapHeight-1), this.random(0,mapWidth-1)];
      while (this.isPositionExistIn(randomResourcePosition, resourcePosition)) {
        randomResourcePosition = [this.random(1,mapHeight-1), this.random(0,mapWidth-1)];
      }
      resourcePosition.push(randomResourcePosition);
      // Name
      if (resourceName.length === 0) resourceName.push("wood");
      else if (resourceName.length === 1) resourceName.push("stone");
      else this.random(0,1) === 0 ? resourceName.push("wood") : resourceName.push("stone");
    }

    // Blank creation
    for (let r = 0; r < mapHeight; r++) {
      let row = [];
      for (let c = 0; c < mapWidth; c++) {
        row.push("");
      }
      newGameState.grid.push(row);
    }
    // Resource placement
    for (let i = 0; i < resourcePosition.length; i++) {
      if (resourceName[i] === "wood") newGameState.grid[resourcePosition[i][0]][resourcePosition[i][1]] = new Resource("wood", "Arbre", "wood", 1, "Du bois", "resource");
      else if (resourceName[i] === "stone") newGameState.grid[resourcePosition[i][0]][resourcePosition[i][1]] = new Resource("stone", "Roche", "stone", 3, "De la pierre", "resource");
    }

    // Waves preparation
    newGameState.wave = 0;
    newGameState.spawnStrip = [];
    let stripLength: number = this.random(6, 20);
    for (let i = 0; i < stripLength; i++) {
      newGameState.spawnStrip.push("");
    }
    let enemiesCount: number = Math.floor(stripLength/3);
    if (type ===  "elite") enemiesCount = Math.floor(stripLength/2);
    else if (type === "boss") enemiesCount = stripLength-1;
    while (enemiesCount !== 0) {
      let randomSpawnTime = this.random(1,stripLength-1);
      if (newGameState.spawnStrip[randomSpawnTime] === "") {
        newGameState.spawnStrip[randomSpawnTime] = this.generateEnemyName();
        enemiesCount --;
      }
    }
    newGameState.spawnStrip[stripLength-1] = this.generateEnemyName();

    newGameState.display = "battle";
  }

  generateEnemyName(): string {
    let newGameState: GameState = this._gameState$.getValue();
    let enemyName: string = "worm";
    let enemiesAllowed: string[] = this.informationOf.getAllEnemiesNames();
    newGameState.relics.forEach(relic => {
      if (relic.name.startsWith("anti-")) {
        for (let i = 0; i < enemiesAllowed.length; i++) {
          if (relic.name.endsWith(enemiesAllowed[i])) {
            enemiesAllowed.splice(i,1);
            i --;
          }
        }
      }
    });
    if (enemiesAllowed.length !== 0) enemyName = enemiesAllowed[this.random(0, enemiesAllowed.length-1)];
    return enemyName;
  }

  generateShelter(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.display = "shelter";
    newGameState.mapState.shelterCount --;
  }

  generateSeller(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.display = "seller";
    newGameState.mapState.sellerCount --;
  }

  getSacrificeResourceGain(resource: "gem" | "stone" | "wood"): number {
    return this.sacrificeResourceGain[resource];
  }

  getRepairResourceCost(resource: "stone" | "wood"): number {
    return this.repairResourceCost[resource];
  }

  sacrificeFor(resource: "gem" | "stone" | "wood"): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.structure > 1) {
      newGameState.structure --;
      newGameState[resource] += this.sacrificeResourceGain[resource];
    }
  }

  shelterBuild(type: "building" | "tower", name: string): void {
    let newGameState: GameState = this._gameState$.getValue();
    let typeUnlocked = type+"sUnlocked" as "buildingsUnlocked" | "towersUnlocked";
    if (this.informationOf.getWithNameType(name, type).stoneCost > newGameState.stone || this.informationOf.getWithNameType(name, type).woodCost > newGameState.wood) return;

    newGameState.stone -= this.informationOf.getWithNameType(name, type).stoneCost;
    newGameState.wood -= this.informationOf.getWithNameType(name, type).woodCost;
    newGameState[typeUnlocked].push(name);
    newGameState[typeUnlocked] = newGameState[typeUnlocked].sort();
  }

  backToMap(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.display = "map";
  }

  backHome(): void {
    this.router.navigateByUrl("");
  }

  getBuildingsToSell(): Building[] {
    let newGameState: GameState = this._gameState$.getValue();
    let count: number = this.random(0,1);
    if (count === 0) return [];
    let buildings: Building[] = [];
    let allBuildings: Building[] = this.informationOf.getAllBuildings();

    for (let i = 0; i < count; i++) {
      let randomIndex: number = this.random(0, allBuildings.length-1);
      buildings.push(allBuildings[randomIndex]);
      newGameState.relics.forEach(relic => {
        if (relic.name === "seller-cost-reduction") {
          buildings[i].gemCost -= relic.quantity;
          if (buildings[i].gemCost < 3) buildings[i].gemCost = 3;
        }
      });
    }

    return buildings;
  }

  getTowersToSell(): Tower[] {
    let newGameState: GameState = this._gameState$.getValue();
    let count: number = this.random(1,2);
    let towers: Tower[] = [];
    let allTowers = this.informationOf.getAllTowers();

    while (towers.length < count) {
      let randomIndex: number = this.random(0, allTowers.length-1);
      if (!towers.includes(allTowers[randomIndex])) {
        towers.push(allTowers[randomIndex]);
        newGameState.relics.forEach(relic => {
          if (relic.name === "seller-cost-reduction") {
            towers[towers.length-1].gemCost -= relic.quantity;
            if (towers[towers.length-1].gemCost < 3) towers[towers.length-1].gemCost = 3;
          }
        });
      }
    }

    return towers;    
  }

  learnBlueprint(name: string, type: "building" | "tower"): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (type === "building") {
      let allBuildings: Building[] = this.informationOf.getAllBuildings();
      let nameExist: boolean = false;
      let price: number | undefined;
      for (let i = 0; i < allBuildings.length; i++) {
        if (allBuildings[i].name === name) {
          nameExist = true;
          price = allBuildings[i].gemCost;
          break;
        }
      }
      if (!nameExist) return;
      if (typeof price == 'undefined' || price > newGameState.gem) return;
      for (let i = 0; i < newGameState.buildingsBlueprints.length; i++) {
        if (newGameState.buildingsBlueprints[i] === name) return;
      }
      newGameState.buildingsBlueprints.push(name);
      newGameState.gem -= price;
    } else {
      let allTowers: Tower[] = this.informationOf.getAllTowers();
      let nameExist: boolean = false;
      let price: number | undefined = undefined;
      for (let i = 0; i < allTowers.length; i++) {
        if (allTowers[i].name === name) {
          nameExist = true;
          price = allTowers[i].gemCost;
          break;
        }
      }
      if (!nameExist) return;
      if (typeof price == 'undefined' || price > newGameState.gem) return;
      for (let i = 0; i < newGameState.towersBlueprints.length; i++) {
        if (newGameState.towersBlueprints[i] === name) return;
      }
      newGameState.towersBlueprints.push(name);
      newGameState.gem -= price;
    }
  }

  getRelicsToSell(): Relic[] {
    let newGameState: GameState = this._gameState$.getValue();
    let quantity: number = this.random(1,3);
    let relicsToSell: Relic[] = [];
    let allRelics: Relic[] = this.informationOf.getAllRelics();
    for (let i = 0; i < quantity; i++) {
      let randomIndex: number = this.random(0, allRelics.length-1);
      if (allRelics[randomIndex].name.startsWith("anti-")) {
        let exist: boolean = false;
        for (let r = 0; r < newGameState.relics.length; i++) {
          if (newGameState.relics[r].name === allRelics[randomIndex].name) {
            exist = true;
            i --;
          }
        }
        if (!exist) relicsToSell.push(allRelics[randomIndex]);
      } else {
        relicsToSell.push(allRelics[randomIndex]);
      }
      // reduction
      newGameState.relics.forEach(relic => {
        if (relic.name === "seller-cost-reduction") {
          relicsToSell[i].gemCost -= relic.quantity;
          if (relicsToSell[i].gemCost < 3) relicsToSell[i].gemCost = 3;
        }
      });
    }
    return relicsToSell;
  }

  buyRelic(name: string): void {
    let newGameState: GameState = this._gameState$.getValue();
    let allRelics: Relic[] = this.informationOf.getAllRelics();
    for (let i = 0; i < allRelics.length; i++) {
      if (allRelics[i].name === name && newGameState.gem >= allRelics[i].gemCost) {
        this.addRelic(allRelics[i]);
        newGameState.gem -= allRelics[i].gemCost;
      }
    }
  }

  repair(): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.stone >= this.repairResourceCost["stone"] && newGameState.wood >= this.repairResourceCost["wood"]){
      newGameState.stone -= this.repairResourceCost["stone"];
      newGameState.wood -= this.repairResourceCost["wood"];
      newGameState.structure ++;
    }
  }

  getCoordinateFromRowColumn(wxy: "w" | "x" | "y", r: number, c: number): number {
    let cellHeight = document.getElementById("grid")?.getElementsByClassName("object")[0]?.getElementsByTagName("tr")[r]?.getElementsByTagName("td")[c]?.style.height;
    let coord: number = -1;
    if (wxy === "w" && typeof(cellHeight) === 'string') coord = parseInt(cellHeight);
    else if (wxy === "x" && typeof(cellHeight) === 'string') coord = parseInt(cellHeight) * c;
    else if (wxy === "y" && typeof(cellHeight) === 'string') coord = parseInt(cellHeight) * r;
    return coord;
  }

  addNewRandomRelic(): Relic {
    let allRelics: Relic[] = this.informationOf.getAllRelics();
    let newRelic: Relic = allRelics[this.random(0, allRelics.length-1)];
    while (newRelic.name.startsWith("anti-")) newRelic = allRelics[this.random(0, allRelics.length-1)];
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.displaySubtype === "elite") this.addRelic;
    return newRelic;
  }

  addRelic(newRelic: Relic): void {
    let newGameState: GameState = this._gameState$.getValue();
    let isAdded: boolean = false;
    for (let i = 0; i < newGameState.relics.length; i++) {
      if (newGameState.relics[i].name === newRelic.name) {
        newGameState.relics[i].quantity ++;
        isAdded = true;
        break;
       }
    }
    if (!isAdded) {
      newRelic.quantity = 1;
      newGameState.relics.push(newRelic);
    }
    // update price
    if (newRelic.name === "repair-cost-reduction") {
      if (this.repairResourceCost.stone > 3) this.repairResourceCost.stone --;
      if (this.repairResourceCost.wood > 4) this.repairResourceCost.wood --;
    }
    this._setGameState$(newGameState);
  }

}
