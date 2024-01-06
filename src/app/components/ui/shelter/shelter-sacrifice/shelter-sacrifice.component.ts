import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-shelter-sacrifice',
  templateUrl: './shelter-sacrifice.component.html',
  styleUrls: ['./shelter-sacrifice.component.scss']
})
export class ShelterSacrificeComponent {

  @Input()
  gameState!: GameState;

  @Input()
  sacrificeStoneGain!: number;

  @Input()
  sacrificeWoodGain!: number;

  @Output()
  sacrificeEmitter: EventEmitter<"gem" | "stone" | "wood"> = new EventEmitter();

  sacrifice(resource: "gem" | "stone" | "wood"): void {
    this.sacrificeEmitter.emit(resource);
  }

}
