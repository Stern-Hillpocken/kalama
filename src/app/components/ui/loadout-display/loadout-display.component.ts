import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { Relic } from 'src/app/models/relic.model';
import { Tower } from 'src/app/models/tower.model';

@Component({
  selector: 'app-loadout-display',
  templateUrl: './loadout-display.component.html',
  styleUrls: ['./loadout-display.component.scss']
})
export class LoadoutDisplayComponent {

  @Input()
  gameState!: GameState;

  @Input()
  allBuildings!: Building[];

  @Input()
  allTowers!: Tower[];

  @Input()
  allRelics!: Relic[];

  @Input()
  isLoadoutDisplayed!: boolean;

  @Output()
  loadoutEmitter: EventEmitter<void> = new EventEmitter();

  @Output()
  informationOfObjectEmitter: EventEmitter<string[]> = new EventEmitter();

  isAllLoadoutDisplayed: boolean = false;

  changeLoadoutDisplay(): void {
    this.loadoutEmitter.emit();
  }

  displayInfo(name: string, type: "building" | "tower" | "relic"): void {
    this.informationOfObjectEmitter.emit([name, type]);
  }

  displayAllLoadout(): void {
    this.isAllLoadoutDisplayed = !this.isAllLoadoutDisplayed
  }

}
