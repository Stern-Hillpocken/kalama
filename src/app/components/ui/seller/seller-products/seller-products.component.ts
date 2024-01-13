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

  @Output()
  learnEmitter: EventEmitter<string[]> = new EventEmitter();

  information(name: string, type: "building" | "tower"): void {
    this.informationOfObjectEmitter.emit([name, type]);
  }

  learn(name: string, type: "building" | "tower"): void {
    this.learnEmitter.emit([name, type]);
  }

  hasBlueprint(name: string, type: "building" | "tower"): boolean {
    let allElements: string[];
    if (type === "building") allElements = this.gameState.buildingsBlueprints;
    else allElements = this.gameState.towersBlueprints;
    for (let i = 0; i < allElements.length; i++) {
      if (allElements[i] === name) return true;
    }
    return false;
  }

}
