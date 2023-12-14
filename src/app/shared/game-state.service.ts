import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { PopupService } from './popup.service';
import { Tower } from '../models/tower.model';
import { Building } from '../models/building.model';
import { Character } from '../models/character.model';
import { Enemy } from '../models/enemy.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly _gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(new GameState("", 0, "", 0, 0, 0, 0, 0, "", 0, 0, [], [], [], [], [], 0, [], [[],[],[],[],[],[]]));

  constructor(
    private router: Router
  ) {}

  _getGameState$(): Observable<GameState> {
    return this._gameState$.asObservable();
  }

  _setGameState$(state: GameState): void {
    this._gameState$.next(state);
  }

  initialisation(difficulty: number): void {
    this._setGameState$(new GameState("battle", difficulty, "preparation", 15, 0, 3, 2, 0, "dash", 3, 3, [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], ["ram","ram","wall"], ["ram","ram","wall"], 0, ["","","","","worm","","worm"], [["","","","","",""],["","","","","",""],["",{name: "wood", image:"wood", life:1, type:"resource"},"","","",""],["","","","","",""],["","","","",{name: "stone", image:"stone", life:2, type:"resource"},""],["","","","","",""]])); 
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
          let building = newGameState.grid[r][c];

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
          let tower = newGameState.grid[r][c];

          // trigger
          if (tower.state[tower.step] === "attack"){
            if (tower.targetSpot.includes("top") && newGameState.grid[r-1][c] && newGameState.grid[r-1][c].type && newGameState.grid[r-1][c] && newGameState.grid[r-1][c].type === "enemy"){
              newGameState.grid[r-1][c].life -= tower.damage;
              if (newGameState.grid[r-1][c].life <= 0) newGameState.grid[r-1][c] = "";
            }
          }
          // add step
          tower.step ++;
          if (tower.step >= tower.state.length) tower.step = 0;
          // change visual
          if(tower.state[tower.step] === "attack") tower.image = tower.name + "-engaged";
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
                if (newGameState.grid[r+1][c].type === "character") newGameState.koCounter = 3;
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

    newGameState.grid[rowToSpawn][randomSpotChoosed] = new Enemy(newGameState.spawnStrip[newGameState.wave], newGameState.spawnStrip[newGameState.wave], 1, 0, ["down"], newGameState.wave, 1, "enemy");
    this._setGameState$(newGameState);
  }

  placeConstruction(name: string, position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.grid[position[0]][position[1]] !== "") return;

    if (name === "character" && newGameState.koCounter === 0) newGameState.grid[position[0]][position[1]] = new Character("character", "character", 1, 1, "character");

    for (let i = 0; i < newGameState.buildingsAvailable.length; i++){
      if (newGameState.buildingsAvailable[i] === name){
        newGameState.buildingsAvailable.splice(i,1);
        newGameState.grid[position[0]][position[1]] = new Building(name, name, 1, 1, "building");
        break;
      }
    }

    let characterPosition: number[] = [];
    for (let r = 0; r < newGameState.grid.length; r++){
      for(let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].image && newGameState.grid[r][c].image === "character"){
          characterPosition = [r,c];
        }
      }
    }
    for (let i = 0; i < newGameState.towersAvailable.length; i++){
      if (newGameState.towersAvailable[i] === name){
        if (characterPosition.length === 0) return;
        if (((position[0] === characterPosition[0]+1 || position[0] === characterPosition[0]-1) && position[1] === characterPosition[1]) || (position[0] === characterPosition[0] && (position[1] === characterPosition[1]-1 || position[1] === characterPosition[1]+1))){
          newGameState.towersAvailable.splice(i,1);
          newGameState.grid[position[0]][position[1]] = new Tower(name, name, 1,  1, ["wait", "attack"], 0, "top", "tower");
          this.endTurn();
          break;
        }
      }
    }
    //this._setGameState$(newGameState);
  }

  moveCharacter(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.state === "preparation") return;

    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].name && newGameState.grid[r][c].name === "character"){
          if (newGameState.grid[position[0]][position[1]] === ""){
            newGameState.grid[position[0]][position[1]] = newGameState.grid[r][c];
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

  getCharacterPosition(): number[] {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].name && newGameState.grid[r][c].name === "character") return [r,c];
      }
    }
    return [];
  }

  powerDash(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    let charPosition: number[] = this.getCharacterPosition();
    if (newGameState.grid[position[0]][position[1]] === ""){
      newGameState.grid[position[0]][position[1]] = newGameState.grid[charPosition[0]][charPosition[1]];
      newGameState.grid[charPosition[0]][charPosition[1]] = "";
      newGameState.currentPowerCoolDown = 0;
      this.endTurn();
    }
  }

}
