import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { Tower } from '../models/tower.model';
import { Building } from '../models/building.model';
import { Character } from '../models/character.model';
import { Enemy } from '../models/enemy.model';
import { Router } from '@angular/router';
import { Resource } from '../models/resource.model';
import { MapState } from '../models/map-state.model';
import { HttpClient } from '@angular/common/http';
import { InformationOf } from './information-of.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly _gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(new GameState("", 0, "", new MapState(0,0,0,0,0), [-1,-1], false, 0, 0, 0, 0, 0, "", 0, 0, [], [], [], [], [], [], [], 0, [], [[],[],[],[],[],[]]));

  constructor(
    private router: Router,
    private informationOf: InformationOf
  ) { }

  _getGameState$(): Observable<GameState> {
    return this._gameState$.asObservable();
  }

  _setGameState$(state: GameState): void {
    this._gameState$.next(state);
  }

  launchTuto(): void {
    this._setGameState$(new GameState("battle", 0, "preparation", new MapState(0,0,0,0,0), [-1,-1], false, 15, 0, 3, 2, 0, "dash", 3, 3, [], [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], [], ["ram","ram","wall"], ["ram","ram","wall"], 0, ["","","","","worm","","worm"], [["","","","","",""],["","","","","",""],["",new Resource("wood", "wood", 1, "Du bois à récolter", "resource"),"","","",""],["","","","","",""],["","","","",new Resource("stone", "stone", 2, "De la pierre à exploiter", "resource"),""],["","","","","",""]]));
  }

  endTurn(): void {
    this.upkeep();
    this.buildingsProduction();
    this.towersTrigger();
    this.moveEnemies();
    this.spawn();
    this.checkEndBattle();
  }

  upkeep(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.wave ++;
    if (newGameState.koCounter > 0) newGameState.koCounter --;
    if (newGameState.currentPowerCoolDown < newGameState.maxPowerCoolDown) newGameState.currentPowerCoolDown ++;
    //this._setGameState$(newGameState);
  }

  buildingsProduction(): void {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "building"){
          let building : Building = newGameState.grid[r][c];

          if (building.name === "wood-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "wood") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "wood"))){
            newGameState.wood += building.efficiency;
          } else if (building.name === "stone-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "stone") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "stone"))){
            newGameState.stone += building.efficiency;
          }

        }
      }
    }
  }

  towersTrigger(): void {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "tower"){
          let tower: Tower = newGameState.grid[r][c];

          // trigger
          if (tower.sequence[tower.step] === "attack"){
            if (tower.tileTargeted.includes("top") && newGameState.grid[r-1][c] && newGameState.grid[r-1][c].type && newGameState.grid[r-1][c] && newGameState.grid[r-1][c].type === "enemy"){
              newGameState.grid[r-1][c].life -= tower.damage;
              if (newGameState.grid[r-1][c].life <= 0) newGameState.grid[r-1][c] = "";
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
  }

  moveEnemies(): void {
    let newGameState: GameState = this._gameState$.getValue();
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
              newGameState.grid[r+1][c] = this.enemyPreparationForNextTurn(newGameState.grid[r+1][c]);
              newGameState.grid[r][c] = "";
            } else if (newGameState.grid[r+1][c] !== "enemy"){
              newGameState.grid[r+1][c].life -= newGameState.grid[r][c].damage;
              if (newGameState.grid[r+1][c].life <= 0){
                if (newGameState.grid[r+1][c].type === "character") {
                  newGameState.koCounter = newGameState.maxPowerCoolDown;
                  newGameState.characterPosition = [-1,-1];
                }
                newGameState.grid[r+1][c] = "";
              }
              newGameState.grid[r][c] = this.enemyPreparationForNextTurn(newGameState.grid[r][c]);
            }
          }
        }

      }
    }
  }

  enemyPreparationForNextTurn(gs: any): any {
    gs.currentMoveStep ++;
    gs.activeWave ++;
    if (gs.currentMoveStep >= gs.moves.length) gs.currentMoveStep = 0;
    return gs;
  }

  random(min: number, max: number): number{
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  spawn(): void {
    let newGameState: GameState = this._gameState$.getValue();
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
    newGameState.grid[rowToSpawn][randomSpotChoosed] = new Enemy(newEnemy.name, newEnemy.image, newEnemy.life, newEnemy.currentMoveStep, newEnemy.moves, newEnemy.activeWave, newEnemy.damage, newEnemy.description, "enemy");
    newGameState.grid[rowToSpawn][randomSpotChoosed].activeWave = newGameState.wave;
    this._setGameState$(newGameState);
  }

  placeConstruction(name: string, position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.grid[position[0]][position[1]] !== "") return;

    if (name === "character" && newGameState.koCounter === 0) {
      newGameState.grid[position[0]][position[1]] = new Character("character", "character", 1, 1, "C'est vous !", "character");
      newGameState.characterPosition = [position[0],position[1]];
      return;
    }

    for (let i = 0; i < newGameState.buildingsAvailable.length; i++){
      if (newGameState.buildingsAvailable[i] === name){
        newGameState.buildingsAvailable.splice(i,1);
        let newBuilding: Building = this.informationOf.getWithNameType(name, "building");
        newGameState.grid[position[0]][position[1]] = new Building(newBuilding.name, newBuilding.image, newBuilding.life, newBuilding.efficiency, newBuilding.description, newBuilding.gemCost, newBuilding.stoneCost, newBuilding.woodCost, "building");
        return;
      }
    }

    for (let i = 0; i < newGameState.towersAvailable.length; i++){
      if (newGameState.towersAvailable[i] === name){
        if (this.isDiagonallyNearByCharacter(position)){
          newGameState.towersAvailable.splice(i,1);
          let newTower: Tower = this.informationOf.getWithNameType(name, "tower");
          newGameState.grid[position[0]][position[1]] = new Tower(newTower.name, newTower.image, newTower.life, newTower.damage, newTower.sequence, newTower.step, newTower.tileTargeted, newTower.description, newTower.gemCost, newTower.stoneCost, newTower.woodCost, "tower");
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
    if (newGameState.status === "preparation") return;

    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].name && newGameState.grid[r][c].name === "character"){
          if (newGameState.grid[position[0]][position[1]] === ""){
            newGameState.grid[position[0]][position[1]] = newGameState.grid[r][c];
            newGameState.characterPosition = [position[0],position[1]];
            newGameState.grid[r][c] = "";
          } else if (newGameState.grid[position[0]][position[1]].type && newGameState.grid[position[0]][position[1]].type === "enemy") {
            newGameState.grid[position[0]][position[1]].life -= newGameState.grid[r][c].damage;
            if(newGameState.grid[position[0]][position[1]].life <= 0) newGameState.grid[position[0]][position[1]] = "";
          }
          this.endTurn();
          return;
        }
      }
    }
  }

  checkEndBattle(): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.wave < newGameState.spawnStrip.length) return;
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "enemy") return;
      }
    }
    
    newGameState.display = "map";
    // End of tuto
    if (newGameState.difficulty < 1) this.router.navigateByUrl("");
  }

  powerDash(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.grid[position[0]][position[1]] === ""){
      newGameState.grid[position[0]][position[1]] = newGameState.grid[newGameState.characterPosition[0]][newGameState.characterPosition[1]];
      newGameState.grid[newGameState.characterPosition[0]][newGameState.characterPosition[1]] = "";
      newGameState.characterPosition = [position[0],position[1]];
      newGameState.currentPowerCoolDown = 0;
      this.endTurn();
    }
  }

  isPositionExistIn(position: number[], array: number[][]): boolean {
    for (let i = 0; i < array.length; i++) {
      if (position[0] === array[i][0] && position[1] === array[i][1]) return true;
    }
    return false;
  }

  generateBattle(type: "boss" | "battle" | "elite"): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.characterPosition = [-1,-1];
    newGameState.status = "preparation";
    newGameState.koCounter = 0;
    newGameState.currentPowerCoolDown = newGameState.maxPowerCoolDown;
    // Decrease event count
    if (type === "battle") newGameState.mapState.battleCount --;
    else if (type === "elite") newGameState.mapState.eliteCount --;
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
      if (resourceName[i] === "wood") newGameState.grid[resourcePosition[i][0]][resourcePosition[i][1]] = new Resource("wood", "wood", 1, "Du bois", "resource");
      else if (resourceName[i] === "stone") newGameState.grid[resourcePosition[i][0]][resourcePosition[i][1]] = new Resource("stone", "stone", 3, "De la pierre", "resource");
    }

    // Waves preparation
    newGameState.wave = 0;
    newGameState.spawnStrip = [];
    let stripLength: number = this.random(6, 20);
    for (let i = 0; i < stripLength; i++) {
      newGameState.spawnStrip.push("");
    }
    let enemiesCount: number = Math.floor(stripLength/3);
    while (enemiesCount !== 0) {
      let randomSpawnTime = this.random(1,stripLength-1);
      if (newGameState.spawnStrip[randomSpawnTime] === "") {
        newGameState.spawnStrip[randomSpawnTime] = "worm";
        enemiesCount --;
      }
    }
    newGameState.spawnStrip[stripLength-1] = "worm";

    newGameState.display = "battle";
  }

  generateCamp(): void {
    //let newGameState: GameState = this._gameState$.getValue();
  }

  generateSeller(): void {
    //let newGameState: GameState = this._gameState$.getValue();
  }

}
