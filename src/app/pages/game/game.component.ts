import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameState } from 'src/app/models/game-state.model';
import { GameStateService } from 'src/app/shared/game-state.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  gameState!: GameState;

  constructor(
    private gameStateService: GameStateService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.gameStateService._getGameState$().subscribe((state: GameState) => {
      this.gameState = state;
      if(this.gameState.display === "") this.router.navigateByUrl("");
    });
  }

}
