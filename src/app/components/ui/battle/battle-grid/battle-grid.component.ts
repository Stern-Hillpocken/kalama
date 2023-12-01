import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-battle-grid',
  templateUrl: './battle-grid.component.html',
  styleUrls: ['./battle-grid.component.scss']
})
export class BattleGridComponent {

  @Input()
  gameState!: GameState;

  @Output()
  dragPositionEmitter: EventEmitter<number[]> = new EventEmitter();

  @Output()
  clickCellPositionEmitter: EventEmitter<number[]> = new EventEmitter();

  ngAfterViewInit(): void {
    let width: number = Math.floor(window.innerWidth / this.gameState.grid[0].length) - 2;
    document.getElementById("grid")?.querySelectorAll("td").forEach(element => {
      element.style.minWidth = width + "px";
      element.style.height = width + "px";
    });
  }

  onDragEnter(event: any): void {
    let row: number = event.target.parentNode.rowIndex;
    let col: number = event.target.cellIndex;

    if (this.gameState.grid[row][col] === "") event.target.style.backgroundColor = "green";
    else event.target.style.backgroundColor = "red";
    this.dragPositionEmitter.emit([row, col]);
  }

  onDragLeave(event: any): void {
    event.target.style.backgroundColor = "";
  }

  onCellClick(event: any): void {
    this.clickCellPositionEmitter.emit([event.target.parentNode.rowIndex, event.target.cellIndex]);
  }

}
