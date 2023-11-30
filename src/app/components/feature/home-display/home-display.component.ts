import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-display',
  templateUrl: './home-display.component.html',
  styleUrls: ['./home-display.component.scss']
})
export class HomeDisplayComponent {

  constructor(
    private router: Router
  ){}

  onLaunchGameReceive(difficulty: string): void {
    console.log(difficulty)
    this.router.navigateByUrl("game");
  }

}
