import { Component } from '@angular/core';
import { GameStateService } from 'src/app/shared/game-state.service';

@Component({
  selector: 'app-game-shelter',
  templateUrl: './game-shelter.component.html',
  styleUrls: ['./game-shelter.component.scss']
})
export class GameShelterComponent {

  sacrificeStoneGain!: number;
  sacrificeWoodGain!: number;

  constructor(
    private gameStateService: GameStateService
  ){}

  ngOnInit(): void {
    this.sacrificeStoneGain = this.gameStateService.getSacrificeResourceGain("stone");
    this.sacrificeWoodGain = this.gameStateService.getSacrificeResourceGain("wood");
  }

  onSacrificeReceive(resource: "gem" | "stone" | "wood"): void {
    this.gameStateService.sacrificeFor(resource);
  }

}
