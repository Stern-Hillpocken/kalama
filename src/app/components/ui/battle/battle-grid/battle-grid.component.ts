import { Component, Input } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-battle-grid',
  templateUrl: './battle-grid.component.html',
  styleUrls: ['./battle-grid.component.scss']
})
export class BattleGridComponent {

  @Input()
  gameState!: GameState;

  ngAfterViewInit(): void {
    let width: number = Math.floor(window.innerWidth / this.gameState.grid[0].length) - 2;
    document.getElementById("grid")?.querySelectorAll("td").forEach(element => {
      element.style.minWidth = width + "px";
      element.style.height = width + "px";
    });
  }

}
