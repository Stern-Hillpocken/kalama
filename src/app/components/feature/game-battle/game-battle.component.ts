import { Component } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { GameStateService } from 'src/app/shared/game-state.service';

@Component({
  selector: 'app-game-battle',
  templateUrl: './game-battle.component.html',
  styleUrls: ['./game-battle.component.scss']
})
export class GameBattleComponent {

  gameState!: GameState;

  isCharacterOnTheGrid: boolean = false;

  lastDragPosition: number[] = [];

  constructor(
    private gameStateService: GameStateService
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe((state: GameState) => {
      this.gameState = state;
    });
  }

  checkIfCharacterIsOnTheGrid(): boolean {
    for (let r = 0; r < this.gameState.grid.length; r++){
      for (let c = 0; c < this.gameState.grid[r].length; c++){
        if (this.gameState.grid[r][c].image && this.gameState.grid[r][c].image === "character") return true;
      }
    }
    return false;
  }

  onActionReceive(action: string): void {
    if (action === "wait") this.gameStateService.endTurn();
  }

  onDragPositionReceive(position: number[]): void {
    this.lastDragPosition = position;
  }

  onDragEndReceive(image: string): void {
    this.gameStateService.placeConstruction(image, this.lastDragPosition);
    this.lastDragPosition = [];
    this.isCharacterOnTheGrid = this.checkIfCharacterIsOnTheGrid();
  }

  getCharacterPosition(): number[] {
    let characterPosition: number[] = [];
    for (let r = 0; r < this.gameState.grid.length; r++){
      for(let c = 0; c < this.gameState.grid[r].length; c++){
        if (this.gameState.grid[r][c].image && this.gameState.grid[r][c].image === "character"){
          characterPosition = [r,c];
        }
      }
    }
    return characterPosition;
  }

  isNearByCharacter(position: number[]): boolean {
    let characterPosition: number[] = this.getCharacterPosition();
    if (((position[0] === characterPosition[0]+1 || position[0] === characterPosition[0]-1) && position[1] === characterPosition[1]) || (position[0] === characterPosition[0] && (position[1] === characterPosition[1]-1 || position[1] === characterPosition[1]+1))) return true;
    return false;
  }

  onClickCellPositionReceive(position: number[]): void {
    if ((this.gameState.grid[position[0]][position[1]] === "" || (this.gameState.grid[position[0]][position[1]].type && this.gameState.grid[position[0]][position[1]].type === "enemy")) && this.isNearByCharacter(position) && this.gameState.buildingsAvailable.length === 0){
      this.gameStateService.moveCharacter(position);
    }
  }

}
