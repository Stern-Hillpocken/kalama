import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Bubble } from 'src/app/models/bubble.model';
import { GameState } from 'src/app/models/game-state.model';

@Component({
  selector: 'app-battle-grid',
  templateUrl: './battle-grid.component.html',
  styleUrls: ['./battle-grid.component.scss']
})
export class BattleGridComponent {

  @Input()
  gameState!: GameState;

  @Input()
  bubbles!: Bubble[];

  @Output()
  dragPositionEmitter: EventEmitter<number[]> = new EventEmitter();

  @Output()
  clickCellPositionEmitter: EventEmitter<number[]> = new EventEmitter();

  floorTiles: number[][] = [];

  carpetTiles: number[][] = [];

  ngOnInit(): void {
    this.generateFloorAndCarpetTiles();
  }

  ngAfterViewInit(): void {
    let width: number = Math.floor(window.innerWidth / this.gameState.grid[0].length) - 2;
    if (width > 80) width = 80;
    document.getElementById("grid")?.querySelectorAll("td").forEach(element => {
      element.style.minWidth = width + "px";
      element.style.height = width + "px";
    });
  }

  generateFloorAndCarpetTiles(): void {
    for (let r = 0; r < this.gameState.grid.length; r++) {
      this.floorTiles.push([]);
      this.carpetTiles.push([]);
      for (let c = 0; c < this.gameState.grid[r].length; c++) {
        this.floorTiles[r].push(Math.floor(Math.random() * (4 + 1)));
        let isCarpet = Math.random() > 0.7;
        if (isCarpet) this.carpetTiles[r].push(Math.floor(Math.random() * (14 + 1)));
        else this.carpetTiles[r].push(0);
      }
    }
  }

  onDragEnter(event: any): void {
    let row: number = event.target.parentNode.rowIndex;
    let col: number = event.target.cellIndex;
    if (event.target.tagName === "IMG") {
      row = event.target.parentNode.parentNode.rowIndex;
      col = event.target.parentNode.cellIndex;
    }

    if (this.gameState.grid[row][col] === "") {
      if(this.gameState.status === "preparation" || this.isNearByCharacter([row,col])) event.target.style.backgroundColor = "green";
      else event.target.style.backgroundColor = "red";
    }
    else if (event.target.tagName === "TD") event.target.style.backgroundColor = "red";
    else if (event.target.tagName === "IMG") event.target.parentNode.style.backgroundColor = "red";
    this.dragPositionEmitter.emit([row, col]);
  }

  onDragLeave(event: any): void {
    event.target.style.backgroundColor = "";
  }

  onCellClick(event: any): void {
    let row = event.target.parentNode.rowIndex;
    let col = event.target.cellIndex;
    if (event.target.tagName === "IMG") {
      row = event.target.parentNode.parentNode.rowIndex;
      col = event.target.parentNode.cellIndex;
    }
    this.clickCellPositionEmitter.emit([row, col]);
  }

  heartTimesDisplay(heartType: number, lifeTotal: number): number {
    // Special display
    if(lifeTotal === 3) {
      if (heartType === 3) return 0;
      if (heartType === 1) return 3;
    }

    let count: number = 0;
    if (heartType === 6) {
      count = Math.floor(lifeTotal/6);
    } else if (heartType === 3) {
      count = Math.floor(lifeTotal%6/3);
    } else {
      count = Math.floor(lifeTotal%3);
    }
    return count;
  }

  isNearByCharacter(position: number[]): boolean {
    if (Math.abs(position[0] - this.gameState.characterPosition[0]) <= 1 && Math.abs(position[1] - this.gameState.characterPosition[1]) <= 1) return true;
    return false;
  }

}
