import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-background',
  templateUrl: './home-background.component.html',
  styleUrls: ['./home-background.component.scss']
})
export class HomeBackgroundComponent {

  @Output()
  closeBackgroundEmitter: EventEmitter<void> = new EventEmitter();

  close(): void {
    this.closeBackgroundEmitter.emit();
  }
}
