import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { Relic } from 'src/app/models/relic.model';

@Component({
  selector: 'app-battle-reward',
  templateUrl: './battle-reward.component.html',
  styleUrls: ['./battle-reward.component.scss']
})
export class BattleRewardComponent {

  @Input()
  gameState!: GameState;

  @Input()
  gameStartingResources!: any;

  @Input()
  relicGain!: Relic;

  @Output()
  returnToMapEmitter: EventEmitter<void> = new EventEmitter();



  returnToMap(): void {
    this.returnToMapEmitter.emit();
  }

  isDisplayed(): boolean {
    if (this.gameState.wave < this.gameState.spawnStrip.length) return false;
    for (let r = 0; r < this.gameState.grid.length; r++){
      for (let c = 0; c < this.gameState.grid[r].length; c++){
        if (this.gameState.grid[r][c].type && this.gameState.grid[r][c].type === "enemy") return false;
      }
    }
    return true;
  }

}
