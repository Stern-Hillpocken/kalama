import { Component } from '@angular/core';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { Tower } from 'src/app/models/tower.model';
import { GameStateService } from 'src/app/shared/game-state.service';
import { InformationOf } from 'src/app/shared/information-of.service';

@Component({
  selector: 'app-game-shelter',
  templateUrl: './game-shelter.component.html',
  styleUrls: ['./game-shelter.component.scss']
})
export class GameShelterComponent {

  gameState!: GameState;

  buildings!: Building[];
  towers!: Tower[];

  sacrificeStoneGain!: number;
  sacrificeWoodGain!: number;

  isLoadoutDisplayed: boolean = false;

  informationFrame: any = {};

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
    this.sacrificeStoneGain = this.gameStateService.getSacrificeResourceGain("stone");
    this.sacrificeWoodGain = this.gameStateService.getSacrificeResourceGain("wood");
  }

  onSacrificeReceive(resource: "gem" | "stone" | "wood"): void {
    this.gameStateService.sacrificeFor(resource);
  }

  onBuildReceive(event: string[]): void {
    this.gameStateService.shelterBuild(event[0] as "building" | "tower", event[1]);
  }

  onLoadoutReceive(): void {
    this.isLoadoutDisplayed = !this.isLoadoutDisplayed;
    this.informationFrame = {};
  }

  onInformationOfObjectReceive(event: string[]): void {
    this.informationFrame = this.informationOf.getWithNameType(event[0], event[1] as "enemy" | "building" | "tower" | "relic");
  }

}
