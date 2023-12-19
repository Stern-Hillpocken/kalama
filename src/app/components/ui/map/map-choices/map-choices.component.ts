import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-map-choices',
  templateUrl: './map-choices.component.html',
  styleUrls: ['./map-choices.component.scss']
})
export class MapChoicesComponent {

  @Input()
  gameState!: GameState;

  @Output()
  goToEventEmitter: EventEmitter<string> = new EventEmitter();

  goToEvent(typeOfEvent: string): void {
    this.goToEventEmitter.emit(typeOfEvent);
  }

}
