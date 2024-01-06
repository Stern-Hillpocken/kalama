import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { Tower } from 'src/app/models/tower.model';

@Component({
  selector: 'app-shelter-build',
  templateUrl: './shelter-build.component.html',
  styleUrls: ['./shelter-build.component.scss']
})
export class ShelterBuildComponent {

  @Input()
  gameState!: GameState;

  @Input()
  buildings!: Building[];

  @Input()
  towers!: Tower[];

  @Output()
  buildEmitter: EventEmitter<string[]> = new EventEmitter();

  costDisplay(type: "building" | "tower", name: string, resource: "stone" | "wood"): number {
    let resourceCost = resource+"Cost" as "stoneCost" | "woodCost";
    if (type === "building") {
      for (let i = 0; i < this.buildings.length; i++) {
        if (this.buildings[i].name === name) return this.buildings[i][resourceCost];
      }
    } else {
      for (let i = 0; i < this.towers.length; i++) {
        if (this.towers[i].name === name) return this.towers[i][resourceCost];
      }
    }
    return -1;
  }

  buildTypeName(type: "building" | "tower", name: string): void {
    this.buildEmitter.emit([type, name]);
  }

}
