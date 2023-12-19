import { Component, Input } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-map-choices',
  templateUrl: './map-choices.component.html',
  styleUrls: ['./map-choices.component.scss']
})
export class MapChoicesComponent {

  @Input()
  gameState!: GameState;

}
