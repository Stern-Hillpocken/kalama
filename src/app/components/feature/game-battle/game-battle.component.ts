import { Component } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { PopupMessage } from 'src/app/models/popup-message.model';
import { GameStateService } from 'src/app/shared/game-state.service';
import { PopupService } from 'src/app/shared/popup.service';

@Component({
  selector: 'app-game-battle',
  templateUrl: './game-battle.component.html',
  styleUrls: ['./game-battle.component.scss']
})
export class GameBattleComponent {

  gameState!: GameState;

  popupMessage!: PopupMessage[];

  isCharacterOnTheGrid: boolean = false;

  lastDragPosition: number[] = [];

  constructor(
    private gameStateService: GameStateService,
    private popupService: PopupService
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe((state: GameState) => {
      this.gameState = state;
    });
    this.popupService._getMessage$().subscribe((msg: PopupMessage[]) => {
      this.popupMessage = msg;
    });
  }

  ngAfterContentInit(): void {
    // tutorial
    if (this.gameState.difficulty === 0) this.popupService._setMessage$([new PopupMessage("Bienvenue !","Blabla de bienvenue","tutorial"),new PopupMessage("Les vagues","Victoire et défaite de la partie battle","tutorial"),new PopupMessage("Placement","Perso et constructions","tutorial")])
  }

  checkIfCharacterIsOnTheGrid(): boolean {
    for (let r = 0; r < this.gameState.grid.length; r++){
      for (let c = 0; c < this.gameState.grid[r].length; c++){
        if (this.gameState.grid[r][c].image && this.gameState.grid[r][c].image === "character"){
          // tutorial
          if (this.gameState.difficulty === 0 && this.gameState.buildingsAvailable.length === 0){
            this.popupService._setMessage$([new PopupMessage("Tours", "Placement tours", "tutorial"),new PopupMessage("Déplacement", "Clic sur tuile adjacente, un tour passe", "tutorial")]);
            this.gameState.difficulty = 0.1;
          }
          return true;
        }
      }
    }
    return false;
  }

  onActionReceive(action: string): void {
    if (action === "wait"){
      this.gameStateService.endTurn();
      this.isCharacterOnTheGrid = this.checkIfCharacterIsOnTheGrid();
    }
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
      this.isCharacterOnTheGrid = this.checkIfCharacterIsOnTheGrid();
    }
    // tutorial
    if (this.gameState.difficulty === 0.1 && this.gameState.wave === 4){
      this.popupService._setMessage$([new PopupMessage("Premier ennemi", "Move on it to kill, avoid to be hit", "tutorial")])
      this.gameState.difficulty = 0.2;
    }
  }

  onClosePopupReceive(): void {
    this.popupService.remove();
  }

}
