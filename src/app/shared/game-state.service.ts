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

  wait(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.wave ++;
    this._setGameState$(newGameState);
    this.endTurn();
  }

  endTurn(): void {
    //
  }

}
