import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-choices',
  templateUrl: './home-choices.component.html',
  styleUrls: ['./home-choices.component.scss']
})
export class HomeChoicesComponent {

  @Output()
  buttonSelectionEmitter: EventEmitter<"loadout" | "tutorial" | "background"> = new EventEmitter();

  localStorage: string = "";

  ngOnInit(): void {
    if (!window.localStorage.getItem("kalama")) window.localStorage.setItem("kalama", "background");
    this.localStorage = window.localStorage.getItem("kalama") as string;
  }

  buttonSelect(name: "loadout" | "tutorial" | "background"): void {
    this.buttonSelectionEmitter.emit(name);
    if (name === "background") window.localStorage.setItem("kalama", "tutorial");
    else if (name === "tutorial") window.localStorage.setItem("kalama", "play")
  }

}
