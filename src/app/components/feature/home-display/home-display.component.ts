import { Component } from '@angular/core';

@Component({
  selector: 'app-home-display',
  templateUrl: './home-display.component.html',
  styleUrls: ['./home-display.component.scss']
})
export class HomeDisplayComponent {

  onLaunchGameReceive(difficulty: string): void {
    console.log(difficulty)
  }

}
