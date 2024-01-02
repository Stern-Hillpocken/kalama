import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { InformationOf } from 'src/app/shared/information-of.service';

@Component({
  selector: 'app-map-hud',
  templateUrl: './map-hud.component.html',
  styleUrls: ['./map-hud.component.scss']
})
export class MapHudComponent {

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

  displayInfo(name: string, type: "enemy" | "building" | "tower" | "relic"): void {
    this.informationOfObjectEmitter.emit([name, type]);
  }

}
