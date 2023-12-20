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

  overlapBackgroundSpecial: string = "repeating-linear-gradient(-45deg,transparent,transparent 12.5%,var(--color-special) 12.5%,var(--color-special) 25%)";
  overlapBackgroundAlly: string = "repeating-linear-gradient(-45deg,transparent,transparent 12.5%,var(--color-ally) 12.5%,var(--color-ally) 25%)";
  overlapBackgroundEnemy: string = "repeating-linear-gradient(-45deg,transparent,transparent 12.5%,var(--color-enemy) 12.5%,var(--color-enemy) 25%)";
  overlapBackgroundAllyEnemy: string = "repeating-linear-gradient(-45deg,var(--color-ally),var(--color-ally) 12.5%,var(--color-enemy) 12.5%,var(--color-enemy) 25%)";
  overlapBackgroundSpecialAlly: string = "repeating-linear-gradient(-45deg,var(--color-special),var(--color-special) 12.5%,var(--color-ally) 12.5%,var(--color-ally) 25%)";
  overlapBackgroundSpecialEnemy: string = "repeating-linear-gradient(-45deg,var(--color-special),var(--color-special) 12.5%,var(--color-enemy) 12.5%,var(--color-enemy) 25%)";
  overlapBackgroundSpecialAllyEnemy: string = "repeating-linear-gradient(-45deg,lightblue,lightblue 16.66%,teal 16.66%,teal 33.22%, orange 33.22%, orange 50%)";

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
            this.popupService._setMessage$([new PopupMessage("Prêt", "Clic ready", "tutorial"),new PopupMessage("Tours", "Placement tours", "tutorial"),new PopupMessage("Déplacement", "Clic sur tuile adjacente, un tour passe : donner la séquence d'activation (nos build puis ennemis)", "tutorial")]);
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

  isOrthogonallyNearByCharacter(position: number[]): boolean {
    let charPos: number[] = this.gameState.charcaterPosition;
    if (((position[0] === charPos[0]+1 || position[0] === charPos[0]-1) && position[1] === charPos[1]) || (position[0] === charPos[0] && (position[1] === charPos[1]-1 || position[1] === charPos[1]+1))) return true;
    return false;
  }

  onClickCellPositionReceive(position: number[]): void {
    if ((this.gameState.grid[position[0]][position[1]] === "" || (this.gameState.grid[position[0]][position[1]].type && this.gameState.grid[position[0]][position[1]].type === "enemy")) && this.isOrthogonallyNearByCharacter(position) && this.gameState.buildingsAvailable.length === 0){
      this.gameStateService.moveCharacter(position);
      this.isCharacterOnTheGrid = this.checkIfCharacterIsOnTheGrid();
    } else if (this.isPowerSelected && (position[0] === this.gameState.charcaterPosition[0] || position[1] === this.gameState.charcaterPosition[1]) && this.gameState.grid[position[0]][position[1]] === ""){
      this.gameStateService.powerDash(position);
      this.isPowerSelected = false;
    } else if (this.gameState.grid[position[0]][position[1]] !== "" && this.gameState.grid[position[0]][position[1]].type) {
      this.fillInformationFrame(this.gameState.grid[position[0]][position[1]]);
    }
    this.tilesBackgroundUpdate();
    this.addTilesBackground();
    // tutorial
    if (this.gameState.difficulty === 0.1 && this.gameState.wave === 4){
      this.popupService._setMessage$([new PopupMessage("Premier ennemi", "Move on it to kill, avoid to be hit", "tutorial"),new PopupMessage("Zone déplacement", "Look", "tutorial"),new PopupMessage("Si mort", "On a trois tours", "tutorial")])
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
      this.gameState.status = "ready";
    }
  }

  onUsePowerReceive(): void {
    if (this.gameState.currentPowerCoolDown !== this.gameState.maxPowerCoolDown) return;

    this.isPowerSelected = !this.isPowerSelected;
    if (this.isPowerSelected && this.gameState.power === "dash"){
      this.addTilesBackground();
    } else {
      this.tilesBackgroundUpdate();
    }
  }

  addTilesBackground(): void {
    if (this.isPowerSelected) {
      let powerZone: number[][] = [];
      let charPos: number[] = this.gameState.charcaterPosition;
      if (this.gameState.power === "dash") {
        for (let r = 0; r < this.gameState.grid.length; r++){
          for (let c = 0; c < this.gameState.grid[r].length; c++){
            if (this.gameState.grid[r][c] === "" && (r === charPos[0] || c === charPos[1])){
              powerZone.push([r,c]);
            }
          }
        }
      }
      for (let coordinates = 0; coordinates < powerZone.length; coordinates++){
        let currentStyle = (document.getElementById("grid")?.getElementsByClassName("object")[0].children[powerZone[coordinates][0]].children[powerZone[coordinates][1]] as HTMLTableElement).style;
        switch (currentStyle.background){
          case this.overlapBackgroundAlly : currentStyle.background = this.overlapBackgroundSpecialAlly; break;
          case this.overlapBackgroundEnemy : currentStyle.background = this.overlapBackgroundSpecialEnemy; break;
          case this.overlapBackgroundAllyEnemy : currentStyle.background = this.overlapBackgroundSpecialAllyEnemy; break;
          default : currentStyle.background = this.overlapBackgroundSpecial;
        }
      }
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
            let currentStyle = (document.getElementById("grid")?.getElementsByClassName("object")[0].children[r+1].children[c] as HTMLTableElement).style;
            if (currentStyle.background === this.overlapBackgroundAlly) currentStyle.background = this.overlapBackgroundAllyEnemy;
            else currentStyle.background = this.overlapBackgroundEnemy;
          }
        } else if (this.gameState.grid[r][c].type && this.gameState.grid[r][c].type === "tower" && this.gameState.grid[r][c].sequence[this.gameState.grid[r][c].step] === "attack"){
          if (this.gameState.grid[r][c].tileTargeted === "top" && r-1 >= 0){
            let currentStyle = (document.getElementById("grid")?.getElementsByClassName("object")[0].children[r-1].children[c] as HTMLTableElement).style;
            if (currentStyle.background === this.overlapBackgroundEnemy) currentStyle.background = this.overlapBackgroundAllyEnemy;
            else currentStyle.background = this.overlapBackgroundAlly;
          }
        }

      }
    }
  }

  onChangeLifeDisplayReceive(): void {
    this.gameState.isBattleLifeDisplayed = !this.gameState.isBattleLifeDisplayed;
  }

}
