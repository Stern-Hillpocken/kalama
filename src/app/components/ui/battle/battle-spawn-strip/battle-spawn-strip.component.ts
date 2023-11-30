import { Component, Input } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-battle-spawn-strip',
  templateUrl: './battle-spawn-strip.component.html',
  styleUrls: ['./battle-spawn-strip.component.scss']
})
export class BattleSpawnStripComponent {

  @Input()
  gameState!: GameState;

}
