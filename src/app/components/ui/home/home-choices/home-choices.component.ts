import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-choices',
  templateUrl: './home-choices.component.html',
  styleUrls: ['./home-choices.component.scss']
})
export class HomeChoicesComponent {

  @Output()
  buttonSelectionEmitter: EventEmitter<"loadout" | "tutorial"> = new EventEmitter();

  loadout(): void {
    this.buttonSelectionEmitter.emit("loadout");
  }

  tutorial(): void {
    this.buttonSelectionEmitter.emit("tutorial");
  }

}
