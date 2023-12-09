import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-battle-character',
  templateUrl: './battle-character.component.html',
  styleUrls: ['./battle-character.component.scss']
})
export class BattleCharacterComponent {

  @Input()
  gameState!: GameState;

  @Input()
  isCharacterOnTheGrid!: boolean;

  @Output()
  actionEmitter: EventEmitter<string> = new EventEmitter();

  @Output()
  readyForBattleEmitter: EventEmitter<void> = new EventEmitter();

  wait(): void {
    this.actionEmitter.emit("wait");
  }

  readyForBattle(): void {
    this.readyForBattleEmitter.emit();
  }

}
