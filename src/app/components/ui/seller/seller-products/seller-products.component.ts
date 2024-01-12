import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { Tower } from 'src/app/models/tower.model';

@Component({
  selector: 'app-seller-products',
  templateUrl: './seller-products.component.html',
  styleUrls: ['./seller-products.component.scss']
})
export class SellerProductsComponent {

  @Input()
  gameState!: GameState;

  @Input()
  buildings!: Building[];

  @Input()
  towers!: Tower[];

  @Input()
  buildingsToSell!: Building[];

  @Input()
  towersToSell!: Tower[];

  @Output()
  informationOfObjectEmitter: EventEmitter<string[]> = new EventEmitter();

}
