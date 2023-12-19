import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-loadout',
  templateUrl: './home-loadout.component.html',
  styleUrls: ['./home-loadout.component.scss']
})
export class HomeLoadoutComponent {

  @Output()
  closeLoadoutEmitter: EventEmitter<void> = new EventEmitter();

  @Output()
  launchGameEmitter: EventEmitter<void> = new EventEmitter();

  closeLoadout(): void {
    this.closeLoadoutEmitter.emit();
  }

  launchGame(): void {
    this.launchGameEmitter.emit();
  }

}
