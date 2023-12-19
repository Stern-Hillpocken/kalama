import { Component, Input } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-map-hud',
  templateUrl: './map-hud.component.html',
  styleUrls: ['./map-hud.component.scss']
})
export class MapHudComponent {

  @Input()
  gameState!: GameState;

}
