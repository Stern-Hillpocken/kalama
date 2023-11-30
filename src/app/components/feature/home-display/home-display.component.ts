import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-display',
  templateUrl: './home-display.component.html',
  styleUrls: ['./home-display.component.scss']
})
export class HomeDisplayComponent {

  isLoadout: boolean = false;

  constructor(
    private router: Router
  ){}

  onButtonSelectionReceive(value: string): void {
    if (value === "tutorial") this.router.navigateByUrl("game");
    else if (value === "loadout") this.isLoadout = true;
  }

  onCloseLoadoutReceive(): void {
    this.isLoadout = false;
  }

}
