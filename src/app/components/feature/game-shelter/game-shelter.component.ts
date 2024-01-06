import { Component } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { GameStateService } from 'src/app/shared/game-state.service';

@Component({
  selector: 'app-game-shelter',
  templateUrl: './game-shelter.component.html',
  styleUrls: ['./game-shelter.component.scss']
})
export class GameShelterComponent {

  gameState!: GameState;

  sacrificeStoneGain!: number;
  sacrificeWoodGain!: number;

  constructor(
    private gameStateService: GameStateService
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe(game => {
      this.gameState = game;
    });
    this.sacrificeStoneGain = this.gameStateService.getSacrificeResourceGain("stone");
    this.sacrificeWoodGain = this.gameStateService.getSacrificeResourceGain("wood");
  }

  onSacrificeReceive(resource: "gem" | "stone" | "wood"): void {
    this.gameStateService.sacrificeFor(resource);
  }

}
