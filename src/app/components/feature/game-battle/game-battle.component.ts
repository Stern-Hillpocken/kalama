import { Component } from '@angular/core';
import { Character } from 'src/app/models/character.model';
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

  isPowerSelected: boolean = false;

  informationFrame: any = {};

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
            this.popupService._setMessage$([new PopupMessage("Tours", "Placement tours", "tutorial"),new PopupMessage("Déplacement", "Clic sur tuile adjacente, un tour passe : donner la séquence d'activation (nos build puis ennemis)", "tutorial")]);
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
      this.tilesBackgroundUpdate();
    }
  }

  onDragPositionReceive(position: number[]): void {
    this.lastDragPosition = position;
  }

  onDragEndReceive(image: string): void {
    this.gameStateService.placeConstruction(image, this.lastDragPosition);
    this.lastDragPosition = [];
    this.isCharacterOnTheGrid = this.checkIfCharacterIsOnTheGrid();
    this.tilesBackgroundUpdate();
  }

  getCharacterPosition(): number[] {
    for (let r = 0; r < this.gameState.grid.length; r++){
      for(let c = 0; c < this.gameState.grid[r].length; c++){
        if (this.gameState.grid[r][c].name && this.gameState.grid[r][c].name === "character"){
          return [r,c];
        }
      }
    }
    return [];
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
    } else if (this.isPowerSelected && (position[0] === this.getCharacterPosition()[0] || position[1] === this.getCharacterPosition()[1]) && this.gameState.grid[position[0]][position[1]] === ""){
      this.gameStateService.powerDash(position);
      this.changeTilesBackground([], "");
      this.isPowerSelected = false;
    } else if (this.gameState.grid[position[0]][position[1]] !== "" && this.gameState.grid[position[0]][position[1]].type) {
      this.fillInformationFrame(this.gameState.grid[position[0]][position[1]]);
    }
    this.tilesBackgroundUpdate();
    // tutorial
    if (this.gameState.difficulty === 0.1 && this.gameState.wave === 4){
      this.popupService._setMessage$([new PopupMessage("Premier ennemi", "Move on it to kill, avoid to be hit", "tutorial")])
      this.gameState.difficulty = 0.2;
    }
  }

  fillInformationFrame(obj: any): void {
    this.informationFrame = obj;
  }

  onCloseInformationFrameReceive(): void {
    this.informationFrame = {};
  }

  onClosePopupReceive(): void {
    this.popupService.remove();
  }

  onReadyForBattleReceive(): void {
    if (this.checkIfCharacterIsOnTheGrid()){
      this.gameState.buildingsAvailable = [];
      this.gameState.state = "ready";
    }
  }

  onUsePowerReceive(): void {
    if (this.gameState.currentPowerCoolDown === this.gameState.maxPowerCoolDown){
      this.isPowerSelected = !this.isPowerSelected;
      if (this.isPowerSelected && this.gameState.power === "dash"){
        let dashZone: number[][] = [];
        let charPosition: number[] = this.getCharacterPosition();
        for (let r = 0; r < this.gameState.grid.length; r++){
          for (let c = 0; c < this.gameState.grid[r].length; c++){
            if (this.gameState.grid[r][c] === "" && (r === charPosition[0] || c === charPosition[1])){
              dashZone.push([r,c]);
            }
          }
        }
        this.changeTilesBackground(dashZone, "movement");
      } else {
        this.changeTilesBackground([], "");
      }
      // tutorial
      if (this.isPowerSelected && this.gameState.difficulty < 1) {
        this.popupService._setMessage$([new PopupMessage("Power - dash", "Déplacement durant le tour sur n'importe quelle case vide horizontale ou verticale.", "tutorial")]);
      }
    }
  }

  changeTilesBackground(tiles: number[][], type: string): void {
    if (type === ""){
      for (let r = 0; r < this.gameState.grid.length; r++){
        for (let c = 0; c < this.gameState.grid[r].length; c++){
          (document.getElementById("grid")?.getElementsByClassName("object")[0].children[r].children[c] as HTMLTableElement).style.background = "";
        }
      }
    }
    for (let coordinates = 0; coordinates < tiles.length; coordinates++){
      let currentStyle = (document.getElementById("grid")?.getElementsByClassName("object")[0].children[tiles[coordinates][0]].children[tiles[coordinates][1]] as HTMLTableElement).style;
      if (type === "movement") currentStyle.background = "repeating-radial-gradient(circle, purple, purple 10px, transparent 10px, transparent 20px)";
      else if (type === "attack") currentStyle.background = "repeating-radial-gradient(circle, red, red 10px, #4b026f 10px, #4b026f 20px)";
    }
  }

  tilesBackgroundUpdate(): void {
    for (let r = 0; r < this.gameState.grid.length; r++){
      for (let c = 0; c < this.gameState.grid[r].length; c++){
        (document.getElementById("grid")?.getElementsByClassName("object")[0].children[r].children[c] as HTMLTableElement).style.background = "";
      }
    }
    for (let r = 0; r < this.gameState.grid.length; r++){
      for (let c = 0; c < this.gameState.grid[r].length; c++){

        if (this.gameState.grid[r][c].type && this.gameState.grid[r][c].type === "enemy"){
          if (this.gameState.grid[r][c].moves[this.gameState.grid[r][c].currentMoveStep] === "down" && r+1 < this.gameState.grid.length) {
            (document.getElementById("grid")?.getElementsByClassName("object")[0].children[r+1].children[c] as HTMLTableElement).style.background = "repeating-linear-gradient(-45deg,lightblue,lightblue 10px,teal 10px,teal 20px)";
          }
        } else if (this.gameState.grid[r][c].type && this.gameState.grid[r][c].type === "tower" && this.gameState.grid[r][c].state[this.gameState.grid[r][c].step] === "attack"){
          if (this.gameState.grid[r][c].targetSpot === "top" && r-1 >= 0){
            (document.getElementById("grid")?.getElementsByClassName("object")[0].children[r-1].children[c] as HTMLTableElement).style.background = "repeating-linear-gradient(-45deg,red,red 10px,orange 10px,orange 20px)";
          }
        }

      }
    }
  }

}
