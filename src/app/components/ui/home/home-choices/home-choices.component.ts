import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-choices',
  templateUrl: './home-choices.component.html',
  styleUrls: ['./home-choices.component.scss']
})
export class HomeChoicesComponent {

  @Output()
  launchGameEmitter: EventEmitter<string> = new EventEmitter();

  newGame(): void {
    this.launchGameEmitter.emit("normal game");
  }

  tutorial(): void {
    this.launchGameEmitter.emit("tuto");
  }

}
