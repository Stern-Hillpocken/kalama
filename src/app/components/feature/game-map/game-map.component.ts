import { Component } from '@angular/core';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { Relic } from 'src/app/models/relic.model';
import { Tower } from 'src/app/models/tower.model';
import { GameStateService } from 'src/app/shared/game-state.service';
import { InformationOf } from 'src/app/shared/information-of.service';

@Component({
  selector: 'app-game-map',
  templateUrl: './game-map.component.html',
  styleUrls: ['./game-map.component.scss']
})
export class GameMapComponent {

  gameState!: GameState;

  allBuildings!: Building[];
  allTowers!: Tower[];
  allRelics!: Relic[];

  isLoadoutDisplayed: boolean = false;

  informationFrame: any = {};

  constructor(
    private gameStateService: GameStateService,
    private informationOf: InformationOf
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe(state => this.gameState = state);
    this.allBuildings = this.informationOf.getAllBuildings();
    this.allTowers = this.informationOf.getAllTowers();
    this.allRelics = this.informationOf.getAllRelics();
  }

  onGoToEventReceive(typeOfEvent: string): void {
    if (typeOfEvent === 'battle' || typeOfEvent === 'boss' || typeOfEvent === 'elite') this.gameStateService.generateBattle(typeOfEvent);
    else if (typeOfEvent === 'shelter') this.gameStateService.generateShelter();
    else if (typeOfEvent === 'seller') this.gameStateService.generateSeller();
  }

  onLoadoutReceive(): void {
    this.isLoadoutDisplayed = !this.isLoadoutDisplayed;
    this.informationFrame = {};
  }

  onInformationOfObjectReceive(event: string[]): void {
    this.informationFrame = this.informationOf.getWithNameType(event[0], event[1] as "enemy" | "building" | "tower" | "relic");
  }

}
