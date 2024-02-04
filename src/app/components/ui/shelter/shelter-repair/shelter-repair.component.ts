import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-shelter-repair',
  templateUrl: './shelter-repair.component.html',
  styleUrls: ['./shelter-repair.component.scss']
})
export class ShelterRepairComponent {

  @Input()
  gameState!: GameState;

  @Input()
  repairStoneCost!: number;

  @Input()
  repairWoodCost!: number;

  @Output()
  repairEmitter: EventEmitter<void> = new EventEmitter();

  repair(): void {
    this.repairEmitter.emit();
  }

  hasNotEnoughResources(): boolean {
    if (this.gameState.stone < this.repairStoneCost || this.gameState.wood < this.repairWoodCost) return true;
    return false;
  }

}
