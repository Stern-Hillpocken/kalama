import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-loadout-display',
  templateUrl: './loadout-display.component.html',
  styleUrls: ['./loadout-display.component.scss']
})
export class LoadoutDisplayComponent {

  @Input()
  gameState!: GameState;

  @Input()
  isLoadoutDisplayed!: boolean;

  @Output()
  loadoutEmitter: EventEmitter<void> = new EventEmitter();

  @Output()
  informationOfObjectEmitter: EventEmitter<string[]> = new EventEmitter();

  changeLoadoutDisplay(): void {
    this.loadoutEmitter.emit();
  }

  displayInfo(name: string, type: "building" | "tower" | "relic"): void {
    this.informationOfObjectEmitter.emit([name, type]);
  }

}
