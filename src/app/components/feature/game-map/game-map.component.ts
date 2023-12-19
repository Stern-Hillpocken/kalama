import { Component } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { GameStateService } from 'src/app/shared/game-state.service';

@Component({
  selector: 'app-game-map',
  templateUrl: './game-map.component.html',
  styleUrls: ['./game-map.component.scss']
})
export class GameMapComponent {

  gameState!: GameState;

  constructor(
    private gameStateService: GameStateService
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe(state => this.gameState = state);
  }

  onGoToEventReceive(typeOfEvent: string): void {
    console.log(typeOfEvent)
  }

}
