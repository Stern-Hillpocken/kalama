import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly _gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(new GameState("battle", 0, 15, 0, 3, 2, 0, "dash", 3, 3, [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], ["ram","ram","wall"], ["ram","ram","wall"], 0, ["","","","","worm","","worm"], [["","","","","",""],["","","","","",""],["",{name: "wood", img:"wood", life:1},"","","",""],["","","","","",""],["","","","",{name: "stone", img:"stone", life:2},""],["","","","","",""]])); // tutorial settings

  constructor() {}

  _getGameState$(): Observable<GameState> {
    return this._gameState$.asObservable();
  }

  _setGameState$(state: GameState): void {
    this._gameState$.next(state);
  }

  endTurn(): void {
    this.increaseWave();
    this.buildingsProduction();
    this.moveEnemies();
    this.spawn();
    this.checkEndBattle();
  }

  increaseWave(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.wave ++;
    this._setGameState$(newGameState);
  }

  buildingsProduction(): void {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "building"){

          if (newGameState.grid[r][c].name === "wood-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "wood") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "wood"))){
            newGameState.wood += newGameState.grid[r][c].efficiency;
          } else if (newGameState.grid[r][c].name === "stone-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "stone") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "stone"))){
            newGameState.stone += newGameState.grid[r][c].efficiency;
          }

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
            } else {
              newGameState.grid[r+1][c].life -= newGameState.grid[r][c].damage;
              if (newGameState.grid[r+1][c].life <= 0) newGameState.grid[r+1][c] = "";
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
    console.log("in-spawn-core")
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

    let randomSpotChoosed = emptySpaces[this.random(0, emptySpaces.length)];

    newGameState.grid[rowToSpawn][randomSpotChoosed] = {name:newGameState.spawnStrip[newGameState.wave], img: newGameState.spawnStrip[newGameState.wave], currentMoveStep:0, moves: ["down"], activeWave:newGameState.wave, damage:1, type:"enemy"};
    this._setGameState$(newGameState);
  }

  placeConstruction(name: string, position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    let type: string = "";
    if (newGameState.grid[position[0]][position[1]] !== "") return;

    if (name === "character"){
      type = "character";
    }
    for (let i = 0; i < newGameState.buildingsAvailable.length; i++){
      if (newGameState.buildingsAvailable[i] === name){
        newGameState.buildingsAvailable.splice(i,1);
        type = "building";
        break;
      }
    }

    let characterPosition: number[] = [];
    for (let r = 0; r < newGameState.grid.length; r++){
      for(let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].img && newGameState.grid[r][c].img === "character"){
          characterPosition = [r,c];
        }
      }
    }
    for (let i = 0; i < newGameState.towersAvailable.length; i++){
      if (newGameState.towersAvailable[i] === name){
        if (characterPosition.length === 0) return;
        if (((position[0] === characterPosition[0]+1 || position[0] === characterPosition[0]-1) && position[1] === characterPosition[1]) || (position[0] === characterPosition[0] && (position[1] === characterPosition[1]-1 || position[1] === characterPosition[1]+1))){
          newGameState.towersAvailable.splice(i,1);
          type = "tower";
          break;
        }
      }
    }
    if (type !== "") newGameState.grid[position[0]][position[1]] = {name: name, img:name, life:1, efficiency:1, type:type};
    this._setGameState$(newGameState);
    if (type === "tower") this.endTurn();
  }

  moveCharacter(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if(newGameState.grid[r][c].img && newGameState.grid[r][c].img === "character"){
          newGameState.grid[r][c] = "";
          break;
        }
      }
    }
    newGameState.grid[position[0]][position[1]] = {img:"character"};
    this._setGameState$(newGameState);
    this.endTurn();
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
    this._setGameState$(newGameState);
  }

}
