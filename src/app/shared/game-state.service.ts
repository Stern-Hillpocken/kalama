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

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly _gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(new GameState("", 0, "", new MapState(0,0,0,0,0), [-1,-1], false, 0, 0, 0, 0, 0, "", 0, 0, [], [], [], [], [], 0, [], [[],[],[],[],[],[]]));

  private towers: Tower[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.http.get('assets/json/towers.json').subscribe((json: any) => {
      for (let i = 0; i < json.length; i++){
        this.towers.push(new Tower(json[i].name, json[i].name, json[i].life, json[i].damage, json[i].sequence, 0, json[i].tileTargeted, json[i].description, "tower"));
      }
    });
  }

  _getGameState$(): Observable<GameState> {
    return this._gameState$.asObservable();
  }

  _setGameState$(state: GameState): void {
    this._gameState$.next(state);
  }

  getTowers(): Tower[] {
    return this.towers;
  }

  initialisation(difficulty: number): void {
    if (difficulty === 0) this._setGameState$(new GameState("battle", difficulty, "preparation", new MapState(0,0,0,0,0), [-1,-1], false, 15, 0, 3, 2, 0, "dash", 3, 3, [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], ["ram","ram","wall"], ["ram","ram","wall"], 0, ["","","","","worm","","worm"], [["","","","","",""],["","","","","",""],["",new Resource("wood", "wood", 1, "Du bois à récolter", "resource"),"","","",""],["","","","","",""],["","","","",new Resource("stone", "stone", 2, "De la pierre à exploiter", "resource"),""],["","","","","",""]]));
    else this._setGameState$(new GameState("map", difficulty, "preparation", new MapState(12,3,2,2,20), [-1,-1], false, 15, 0, 3, 2, 0, "dash", 3, 3, [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], ["ram","ram","wall"], ["ram","ram","wall"], 0, [], []));
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
                  newGameState.charcaterPosition = [-1,-1];
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

    newGameState.grid[rowToSpawn][randomSpotChoosed] = new Enemy(newGameState.spawnStrip[newGameState.wave], newGameState.spawnStrip[newGameState.wave], 1, 0, ["down"], newGameState.wave, 1, "Un ennemi qui vous attaque", "enemy");
    this._setGameState$(newGameState);
  }

  placeConstruction(name: string, position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.grid[position[0]][position[1]] !== "") return;

    if (name === "character" && newGameState.koCounter === 0) {
      newGameState.grid[position[0]][position[1]] = new Character("character", "character", 1, 1, "C'est vous !", "character");
      newGameState.charcaterPosition = [position[0],position[1]];
    }

    for (let i = 0; i < newGameState.buildingsAvailable.length; i++){
      if (newGameState.buildingsAvailable[i] === name){
        newGameState.buildingsAvailable.splice(i,1);
        newGameState.grid[position[0]][position[1]] = new Building(name, name, 1, 1, "Doit être placé à gauche ou droite d'une ressource", "building");
        break;
      }
    }

    for (let i = 0; i < newGameState.towersAvailable.length; i++){
      if (newGameState.towersAvailable[i] === name){
        if (this.isDiagonallyNearByCharacter(position)){
          newGameState.towersAvailable.splice(i,1);
          for (let j = 0; j < this.towers.length; j++) {
            if (this.towers[j].name === name) {
              newGameState.grid[position[0]][position[1]] = this.towers[j];
              break;
            }
          }
          this.endTurn();
          break;
        }
      }
    }
  }

  isDiagonallyNearByCharacter(position: number[]): boolean {
    let charPos: number[] = this._gameState$.getValue().charcaterPosition;
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
            newGameState.charcaterPosition = [position[0],position[1]];
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

    if (newGameState.difficulty < 1) this.router.navigateByUrl("");
  }

  powerDash(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.grid[position[0]][position[1]] === ""){
      newGameState.grid[position[0]][position[1]] = newGameState.grid[newGameState.charcaterPosition[0]][newGameState.charcaterPosition[1]];
      newGameState.grid[newGameState.charcaterPosition[0]][newGameState.charcaterPosition[1]] = "";
      newGameState.charcaterPosition = [position[0],position[1]];
      newGameState.currentPowerCoolDown = 0;
      this.endTurn();
    }
  }

}
