import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-information-frame',
  templateUrl: './information-frame.component.html',
  styleUrls: ['./information-frame.component.scss']
})
export class InformationFrameComponent {

  @Input()
  informationFrame!: any;

  close(): void {
    this.informationFrame = {};
  }

}
