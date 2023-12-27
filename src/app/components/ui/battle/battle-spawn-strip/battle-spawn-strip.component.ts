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

  spawnVision: number = 4;

  stripDivCount(): number {
    if (this.gameState.wave >= this.gameState.spawnStrip.length) return 1;
    else if (this.gameState.spawnStrip.length - this.gameState.wave > this.spawnVision) return this.spawnVision+1;
    else return this.gameState.spawnStrip.length - this.gameState.wave;
  }

  stripDivContent(index: number): string {
    if (index === this.spawnVision) return "...";
    if (this.gameState.spawnStrip[this.gameState.wave+index] === "") return "-";
    return "X";
  }

}
