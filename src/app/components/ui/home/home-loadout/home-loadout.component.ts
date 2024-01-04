import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { MapState } from 'src/app/models/map-state.model';
import { Tower } from 'src/app/models/tower.model';

@Component({
  selector: 'app-home-loadout',
  templateUrl: './home-loadout.component.html',
  styleUrls: ['./home-loadout.component.scss']
})
export class HomeLoadoutComponent {

  @Input()
  buildings!: Building[];

  @Input()
  towers!: Tower[];

  @Output()
  closeLoadoutEmitter: EventEmitter<void> = new EventEmitter();

  @Output()
  launchGameEmitter: EventEmitter<GameState> = new EventEmitter();

  @Output()
  buildDisplayEmitter: EventEmitter<string[]> = new EventEmitter();

  gameStateChoice!: GameState;

  startingResourcesDisplayed: boolean = false;
  availableEventsDisplayed: boolean = false;
  blueprintsDisplayed: boolean = false;
  towersSelectionDisplayed: boolean = false;

  lastTowerSlot: number = -1;
  isBlueprintCellHover: boolean = false;

  ngOnInit(): void {
    this.setGameStateToDifficulty(1);
  }

  closeLoadout(): void {
    this.closeLoadoutEmitter.emit();
  }

  launchGame(): void {
    this.launchGameEmitter.emit(this.gameStateChoice);
  }

  setGameStateToDifficulty(value: number): void {
    if (value === 1) this.gameStateChoice = new GameState("map", 1, "", new MapState(8,3,3,3,11), [], false, 15, 0, 0, 0, 0, "dash", 3, 3, [], [], [], ["stone-cutter", "wood-cutter"], ["wall"], [], ["wall", "ram", "ram"], 0, [], []);
    else this.gameStateChoice = new GameState("map", 2, "", new MapState(12,3,4,3,15), [], false, 12, 0, 0, 0, 0, "dash", 3, 3, [], [], [], ["stone-cutter", "wood-cutter"], [], [], ["wall", "wall"], 0, [], []);
  }

  changeGameState(type: string, value: number): void {
    if (type === "structure") {
      if (this.gameStateChoice.structure + value > 0) this.gameStateChoice.structure += value;
    } else if (type === "stone") {
      if (this.gameStateChoice.stone + value >= 0) this.gameStateChoice.stone += value;
    } else if (type === "wood") {
      if (this.gameStateChoice.wood + value >= 0) this.gameStateChoice.wood += value;
    } else if (type === "battle") {
      if (this.gameStateChoice.mapState.battleCount + value >= 0) this.gameStateChoice.mapState.battleCount += value;
    } else if (type === "elite") {
      if (this.gameStateChoice.mapState.eliteCount + value >= 0) this.gameStateChoice.mapState.eliteCount += value;
    } else if (type === "seller") {
      if (this.gameStateChoice.mapState.sellerCount + value >= 0) this.gameStateChoice.mapState.sellerCount += value;
    } else if (type === "camp") {
      if (this.gameStateChoice.mapState.campCount + value >= 0) this.gameStateChoice.mapState.campCount += value;
    }
  }

  buildStatDisplay(name: string, type: "building" | "tower"): void {
    this.buildDisplayEmitter.emit([name, type]);
  }

  onDragEnter(divId: number): void {
    this.lastTowerSlot = divId;
  }

  onDragRemoveSelection(): void {
    this.lastTowerSlot = -1;
    this.isBlueprintCellHover = false;
  }

  onDragEnd(event: any): void {
    if (this.lastTowerSlot === -1) return;
    while (this.lastTowerSlot > this.gameStateChoice.towersUnlocked.length) this.lastTowerSlot --;
    this.gameStateChoice.towersUnlocked[this.lastTowerSlot] = event.target.alt;
    this.lastTowerSlot = -1;
  }

  onBlueprintDragEnd(event: any): void {
    if (this.isBlueprintCellHover) {
      for (let i = 0; i < this.buildings.length; i++) {
        if (this.buildings[i].name === event.target.alt) {
          if (this.gameStateChoice.buildingsBlueprints.indexOf(event.target.alt) === -1) this.gameStateChoice.buildingsBlueprints.push(event.target.alt);
          return;
        }
      }
      for (let i = 0; i < this.towers.length; i++) {
        if (this.towers[i].name === event.target.alt) {
          if (this.gameStateChoice.towersBlueprints.indexOf(event.target.alt) === -1) this.gameStateChoice.towersBlueprints.push(event.target.alt);
          return;
        }
      }
    }
  }

  removeBlueprint(type: "building" | "tower", index: number): void {
    if (type === "building") this.gameStateChoice.buildingsBlueprints.splice(index, 1);
    if (type === "tower") this.gameStateChoice.towersBlueprints.splice(index, 1);
  }

  removeTower(index: number): void {
    this.gameStateChoice.towersUnlocked.splice(index, 1);
  }

  estimatedPlayTime(): number {
    return 5 + this.gameStateChoice.mapState.battleCount * 2 + this.gameStateChoice.mapState.eliteCount * 3;
  }

  buildingListMove(type: "blueprint-list" | "tower-list", side: string): void {
    let gap: number = 64+8;
    if (side === "left" && (document.getElementsByClassName(type)[0] as HTMLDivElement).scrollLeft >= gap) (document.getElementsByClassName(type)[0] as HTMLDivElement).scrollLeft -= gap;
    else if (side === "left") (document.getElementsByClassName(type)[0] as HTMLDivElement).scrollLeft = 0;
    else (document.getElementsByClassName(type)[0] as HTMLDivElement).scrollLeft += gap;
  }

  onBlueprintCellEnter(): void {
    this.isBlueprintCellHover = true;
  }

}
