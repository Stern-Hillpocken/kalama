import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { GameState } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly _gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(new GameState("battle", 0, 15, 0, 3, 2, 0, "dash", 3, 3, [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], ["ram","ram","wall"], ["ram","ram","wall"], 1, ["","","","","worm","","worm"], [["","","","","",""],["","","","","",""],["",{img:"wood"},"","","",""],["","","","","",""],["","","","",{img:"stone"},""],["","","","","",""]])); // tutorial settings

  constructor() {}

  _getGameState$(): Observable<GameState> {
    return this._gameState$.asObservable();
  }

  _setGameState$(state: GameState): void {
    this._gameState$.next(state);
  }

  endTurn(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.wave ++;
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
    if (type !== "") newGameState.grid[position[0]][position[1]] = {img:name};
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

}
