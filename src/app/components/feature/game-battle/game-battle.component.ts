import { Component } from '@angular/core';
import { Bubble } from 'src/app/models/bubble.model';
import { GameState } from 'src/app/models/game-state.model';
import { PopupMessage } from 'src/app/models/popup-message.model';
import { BubbleService } from 'src/app/shared/bubble.service';
import { GameStateService } from 'src/app/shared/game-state.service';
import { InformationOf } from 'src/app/shared/information-of.service';
import { PopupService } from 'src/app/shared/popup.service';

@Component({
  selector: 'app-game-battle',
  templateUrl: './game-battle.component.html',
  styleUrls: ['./game-battle.component.scss']
})
export class GameBattleComponent {

  gameState!: GameState;

  bubbles!: Bubble[];

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
    private popupService: PopupService,
    private bubbleService: BubbleService,
    private informationOf: InformationOf
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe((state: GameState) => {
      this.gameState = state;
      console.log(state)
    });
    this.popupService._getMessage$().subscribe((msg: PopupMessage[]) => {
      this.popupMessage = msg;
    });
    this.bubbleService._getGameState$().subscribe((bb: Bubble[]) => {
      this.bubbles = bb;
    });
  }

  ngAfterContentInit(): void {
    // tutorial
    if (this.gameState.difficulty === 0) this.popupService._setMessage$([new PopupMessage("Bienvenue !","Le jeu est divisé en deux phases qui s’alternent : une phase sur une carte, pour choisir vers quel évènement vous rendre, et l’autre phase représentant la résolution de cet évènement. Il y a plusieurs types d’évènements mais le principal est celui du combat. Ce tutoriel explique succinctement son déroulé.","tutorial"),new PopupMessage("Victoire et défaite","Durant un combat, des vagues de monstres arrivent du nord et se déplacent vers le sud. Le jeu est structuré en plusieurs tours, et il est affiché en haut de l’écran à quel tour vous en êtes et si les tours suivants vont faire apparaître des monstres. Vous gagnez le combat si toutes les vagues sont passées sur vous et qu’il ne reste plus de monstre, mais vous perdez si les monstres détruisent votre char-à-voile (en bas de l’écran).","tutorial"),new PopupMessage("Premiers placements","Commencez par placer votre personnage puis les deux constructions à votre disposition en les glissant sur la grille de combat. Vous pouvez observer les caractéristiques de ces dernières en cliquant dessus. Même si vos constructions sont détruites durant un combat, elles seront réparées automatiquement avant le prochain combat.","tutorial")])
  }

  checkIfCharacterIsOnTheGrid(): boolean {
    for (let r = 0; r < this.gameState.grid.length; r++){
      for (let c = 0; c < this.gameState.grid[r].length; c++){
        if (this.gameState.grid[r][c].image && this.gameState.grid[r][c].image === "character"){
          // tutorial
          if (this.gameState.difficulty === 0 && this.gameState.buildingsAvailable.length === 0){
            this.popupService._setMessage$([new PopupMessage("Prêt·e ?", "Une fois que c’est fait (ou que vous ne souhaitez pas poser plus de constructions), vous pouvez <Lancer le combat> et vous préparer à faire face aux vagues de monstres.", "tutorial"),new PopupMessage("Le déplacement", "À partir de ce moment vous pourrez vous déplacer sur la grille de combat en cliquant sur la case orthogonalement adjacente à votre personnage. Le déplacement en diagonale n’est pas autorisé, et la case de destination doit être libre pour s’y rendre. Se déplacer compte comme l’action de votre tour.", "tutorial"),new PopupMessage("Les tours", "Pour vous défendre vous aurez accès à des tours. Pour les placer, glissez les depuis leur réserve vers la grille de combat de manière adjacente à vous. Cette fois-ci la diagonale est autorisée. Placer une tour compte comme l’action de votre tour.", "tutorial"), new PopupMessage("Séquence d’activation", "Une fois après avoir agit (déplacement, construction, pouvoir), le jeu déclenche les autres éléments de la zone de combat. D’abord les constructions alliées, puis les monstres (qui vont soit apparaître, soit se déplacer, soit attaquer).", "tutorial")]);
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
    let charPos: number[] = this.gameState.characterPosition;
    if (((position[0] === charPos[0]+1 || position[0] === charPos[0]-1) && position[1] === charPos[1]) || (position[0] === charPos[0] && (position[1] === charPos[1]-1 || position[1] === charPos[1]+1))) return true;
    return false;
  }

  onClickCellPositionReceive(position: number[]): void {
    if ((this.gameState.grid[position[0]][position[1]] === "" || (this.gameState.grid[position[0]][position[1]].type && this.gameState.grid[position[0]][position[1]].type === "enemy")) && this.isOrthogonallyNearByCharacter(position) && this.gameState.buildingsAvailable.length === 0){
      this.gameStateService.moveCharacter(position);
      this.isCharacterOnTheGrid = this.checkIfCharacterIsOnTheGrid();
    } else if (this.isPowerSelected && (position[0] === this.gameState.characterPosition[0] || position[1] === this.gameState.characterPosition[1]) && this.gameState.grid[position[0]][position[1]] === ""){
      this.gameStateService.powerDash(position);
      this.isPowerSelected = false;
    } else if (this.gameState.grid[position[0]][position[1]] !== "" && this.gameState.grid[position[0]][position[1]].type) {
      this.fillInformationFrame(this.gameState.grid[position[0]][position[1]]);
    }
    this.tilesBackgroundUpdate();
    this.addTilesBackground();
    // tutorial
    if (this.gameState.difficulty === 0.1 && this.gameState.wave === 4){
      this.popupService._setMessage$([new PopupMessage("À l’attaque", "Voici le premier monstre qui vient vers vous ! Vous pouvez vous déplacer sur sa case pour l’attaquer. Si vous le laissez faire, il descendra jusqu’à endommager ce qu’il a devant lui, et donc à un moment : votre char-à-voile.", "tutorial"),new PopupMessage("Zones d’interaction", "Vous avez vu apparaître, devant certaines de vos tours, une zone, c’est leur zone d’attaque. Vous allez retrouver la même chose avec les monstres qui ont leur zone de déplacement. Si un monstre ne peut pas se déplacer dans la zone indiquée, car bloquée par un obstacle, il va à la place attaquer cet obstacle.", "tutorial"),new PopupMessage("Assommé", "Si votre personnage subit trop d’attaque de monstres, il devient assommé. Il vous faut donc <Attendre> pendant trois tours avant de pouvoir revenir dans la zone de combat.", "tutorial")])
      this.gameState.difficulty = 0.2;
    }
  }

  fillInformationFrame(obj: any): void {
    this.informationFrame = obj;
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
    if (this.gameState.currentPowerCoolDown < this.gameState.power.maxPowerCoolDown) return;

    this.isPowerSelected = !this.isPowerSelected;

    if (this.isPowerSelected && this.gameState.power.name === "dash"){
      this.addTilesBackground();
    } else {
      this.tilesBackgroundUpdate();
    }

    if (this.isPowerSelected && this.gameState.power.name === "tower-reload") {
      this.gameStateService.powerTowerReload();
      this.tilesBackgroundUpdate();
      this.isPowerSelected = false;
    }
  }

  addTilesBackground(): void {
    if (this.isPowerSelected) {
      let powerZone: number[][] = [];
      let charPos: number[] = this.gameState.characterPosition;
      if (this.gameState.power.name === "dash") {
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

  onClickConstructionReceive(info: string[]): void {
    this.fillInformationFrame( this.informationOf.getWithNameType(info[0], info[1] as "building" | "tower") );
  }

}
