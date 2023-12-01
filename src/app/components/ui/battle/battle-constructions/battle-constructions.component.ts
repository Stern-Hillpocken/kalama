import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-battle-constructions',
  templateUrl: './battle-constructions.component.html',
  styleUrls: ['./battle-constructions.component.scss']
})
export class BattleConstructionsComponent {

  @Input()
  gameState!: GameState;

  @Input()
  isCharacterOnTheGrid!: boolean;

  @Output()
  dragEndEmitter: EventEmitter<string> = new EventEmitter();

  onDragEnd(event: any): void {
    this.dragEndEmitter.emit(event.target.alt);
  }

}
