import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from 'src/app/shared/game-state.service';

@Component({
  selector: 'app-home-display',
  templateUrl: './home-display.component.html',
  styleUrls: ['./home-display.component.scss']
})
export class HomeDisplayComponent {

  isLoadout: boolean = false;

  constructor(
    private router: Router,
    private gameStateService: GameStateService
  ){}

  onButtonSelectionReceive(value: string): void {
    if (value === "tutorial") {
      this.gameStateService.initialisation(0);
      this.router.navigateByUrl("game");
    }
    else if (value === "loadout") this.isLoadout = true;
  }

  onCloseLoadoutReceive(): void {
    this.isLoadout = false;
  }

  onLaunchGameReceive(): void {
    this.gameStateService.initialisation(1);
    this.router.navigateByUrl("game");
  }

}
