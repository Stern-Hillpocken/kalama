import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  towers!: Tower[];

  @Output()
  closeLoadoutEmitter: EventEmitter<void> = new EventEmitter();

  @Output()
  launchGameEmitter: EventEmitter<GameState> = new EventEmitter();

  gameStateChoice!: GameState;

  towerSelected!: Tower;

  lastTowerSlot: number = -1;

  ngOnInit(): void {
    this.setGameStateToDifficulty(1);
    this.towerSelected = this.towers[0];
  }

  closeLoadout(): void {
    this.closeLoadoutEmitter.emit();
  }

  launchGame(): void {
    this.launchGameEmitter.emit(this.gameStateChoice);
  }

  setGameStateToDifficulty(value: number): void {
    if (value === 1) this.gameStateChoice = new GameState("map", 1, "", new MapState(8,3,3,3,11), [], false, 15, 0, 0, 0, 0, "dash", 3, 3, [], [], [], ["stone-cutter", "wood-cutter"], [], [], ["wall", "ram", "ram"], 0, [], []);
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

  towerStatDisplay(name: string): void {
    for (let i = 0; i < this.towers.length; i++) {
      if (this.towers[i].name === name) {
        this.towerSelected = this.towers[i];
        break;
      }
    }
  }

  onDragStart(event: any): void {
    this.towerStatDisplay(event.target.alt);
  }

  onDragEnter(divId: number): void {
    this.lastTowerSlot = divId;
  }

  onDragState(): void {
    this.lastTowerSlot = -1;
  }

  onDragEnd(event: any): void {
    if (this.lastTowerSlot === -1) return;
    while (this.lastTowerSlot > this.gameStateChoice.towersUnlocked.length) this.lastTowerSlot --;
    this.gameStateChoice.towersUnlocked[this.lastTowerSlot] = event.target.alt;
    this.lastTowerSlot = -1;
  }

  removeTower(index: number): void {
    this.gameStateChoice.towersUnlocked.splice(index, 1);
  }

  estimatedPlayTime(): number {
    return 5 + this.gameStateChoice.mapState.battleCount * 2 + this.gameStateChoice.mapState.eliteCount * 3;
  }

}
