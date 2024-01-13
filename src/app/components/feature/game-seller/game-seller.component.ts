import { Component } from '@angular/core';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { Relic } from 'src/app/models/relic.model';
import { Tower } from 'src/app/models/tower.model';
import { GameStateService } from 'src/app/shared/game-state.service';
import { InformationOf } from 'src/app/shared/information-of.service';

@Component({
  selector: 'app-game-seller',
  templateUrl: './game-seller.component.html',
  styleUrls: ['./game-seller.component.scss']
})
export class GameSellerComponent {

  gameState!: GameState;

  buildings!: Building[];
  towers!: Tower[];
  relics!: Relic[];

  sacrificeGemGain!: number;

  isLoadoutDisplayed: boolean = false;

  informationFrame: any = {};

  buildingsToSell!: Building[];
  towersToSell!: Tower[];
  relicsToSell!: Relic[];

  constructor(
    private gameStateService: GameStateService,
    private informationOf: InformationOf
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe(game => {
      this.gameState = game;
    });
    this.buildings = this.informationOf.getAllBuildings();
    this.towers = this.informationOf.getAllTowers();
    this.relics = this.informationOf.getAllRelics();
    this.sacrificeGemGain = this.gameStateService.getSacrificeResourceGain("gem");
    this.buildingsToSell = this.gameStateService.getBuildingsToSell();
    this.towersToSell = this.gameStateService.getTowersToSell();
    this.relicsToSell = this.gameStateService.getRelicsToSell();
  }

  onSacrificeReceive(): void {
    this.gameStateService.sacrificeFor("gem");
  }

  onLoadoutReceive(): void {
    this.isLoadoutDisplayed = !this.isLoadoutDisplayed;
    this.informationFrame = {};
  }

  onInformationOfObjectReceive(event: string[]): void {
    this.informationFrame = this.informationOf.getWithNameType(event[0], event[1] as "enemy" | "building" | "tower" | "relic");
  }

  backToMap(): void {
    this.gameStateService.backToMap();
  }

  onLearnReceive(nameType: string[]): void {
    this.gameStateService.learnBlueprint(nameType[0], nameType[1] as "building" | "tower");
  }

  onBuyRelicReceive(name: string): void {
    console.log(name)
  }

}
