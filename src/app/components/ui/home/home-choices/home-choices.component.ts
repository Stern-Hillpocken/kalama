import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-choices',
  templateUrl: './home-choices.component.html',
  styleUrls: ['./home-choices.component.scss']
})
export class HomeChoicesComponent {

  @Output()
  buttonSelectionEmitter: EventEmitter<"loadout" | "tutorial" | "background"> = new EventEmitter();

  buttonSelect(name: "loadout" | "tutorial" | "background"): void {
    this.buttonSelectionEmitter.emit(name);
  }

}
