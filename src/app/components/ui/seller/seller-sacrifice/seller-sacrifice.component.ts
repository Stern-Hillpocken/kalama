import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-seller-sacrifice',
  templateUrl: './seller-sacrifice.component.html',
  styleUrls: ['./seller-sacrifice.component.scss']
})
export class SellerSacrificeComponent {

  @Input()
  gameState!: GameState;

  @Input()
  sacrificeGemGain!: number;

  @Output()
  sacrificeEmitter: EventEmitter<void> = new EventEmitter();

  sacrifice(): void {
    this.sacrificeEmitter.emit();
  }

}
