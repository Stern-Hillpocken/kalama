import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Building } from 'src/app/models/building.model';
import { GameState } from 'src/app/models/game-state.model';
import { Power } from 'src/app/models/power.model';
import { Tower } from 'src/app/models/tower.model';
import { GameStateService } from 'src/app/shared/game-state.service';
import { InformationOf } from 'src/app/shared/information-of.service';
import { MapPinService } from 'src/app/shared/map-pin.service';

@Component({
  selector: 'app-home-display',
  templateUrl: './home-display.component.html',
  styleUrls: ['./home-display.component.scss']
})
export class HomeDisplayComponent {

  display: string = "";

  buildings!: Building[];

  towers!: Tower[];

  powers!: Power[];

  informationFrame: any = {};

  constructor(
    private router: Router,
    private gameStateService: GameStateService,
    private informationOf: InformationOf,
    private mapPinService: MapPinService
  ){}

  ngOnInit(): void {
    this.towers = this.informationOf.getAllTowers();
    this.buildings = this.informationOf.getAllBuildings();
    this.powers = this.informationOf.getAllPowers();
  }

  onButtonSelectionReceive(value: string): void {
    if (value === "tutorial") {
      this.gameStateService.launchTuto();
      this.router.navigateByUrl("game");
    } else {
      this.display = value;
    }
  }

  onCloseReceive(): void {
    this.display = "";
  }

  onLaunchGameReceive(game: GameState): void {
    this.gameStateService._setGameState$(game);
    this.mapPinService.initAllPins(game.mapState);
    this.router.navigateByUrl("game");
  }

  onBuildDisplayReceive(build: string[]): void {
    this.informationFrame = this.informationOf.getWithNameType(build[0], build[1] as "building" | "tower");
  }

}
