import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameState } from 'src/app/models/game-state.model';
import { Tower } from 'src/app/models/tower.model';
import { GameStateService } from 'src/app/shared/game-state.service';
import { InformationOf } from 'src/app/shared/information-of.service';

@Component({
  selector: 'app-home-display',
  templateUrl: './home-display.component.html',
  styleUrls: ['./home-display.component.scss']
})
export class HomeDisplayComponent {

  display: string = "";

  towers!: Tower[];

  constructor(
    private router: Router,
    private gameStateService: GameStateService,
    private informationOf: InformationOf
  ){}

  ngOnInit(): void {
    this.towers = this.informationOf.getAllTowers();
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
    this.router.navigateByUrl("game");
  }

}
