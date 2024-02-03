import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { Relic } from 'src/app/models/relic.model';

@Component({
  selector: 'app-battle-end-summary',
  templateUrl: './battle-end-summary.component.html',
  styleUrls: ['./battle-end-summary.component.scss']
})
export class BattleEndSummaryComponent {

  @Input()
  gameState!: GameState;

  @Input()
  gameStartingResources!: any;

  @Input()
  relicGain!: Relic;

  @Output()
  returnToMapEmitter: EventEmitter<void> = new EventEmitter();

  @Output()
  returnToHomeEmitter: EventEmitter<void> = new EventEmitter();

  returnToMap(): void {
    this.returnToMapEmitter.emit();
  }

  returnToHome(): void {
    this.returnToHomeEmitter.emit();
  }

  isBattleEnded(): boolean {
    if (this.gameState.wave < this.gameState.spawnStrip.length) return false;
    for (let r = 0; r < this.gameState.grid.length; r++){
      for (let c = 0; c < this.gameState.grid[r].length; c++){
        if (this.gameState.grid[r][c].type && this.gameState.grid[r][c].type === "enemy") return false;
      }
    }
    return true;
  }

  isEndGame(): boolean {
    if (this.gameState.structure <= 0) return true;
    if (
      this.isBattleEnded() &&
      this.gameState.mapState.battleCount === 0 && this.gameState.mapState.eliteCount === 0 && this.gameState.mapState.bossCount === 0
      ) return true;
    return false;
  }

}
