import { Component, Input } from '@angular/core';
import { Bubble } from 'src/app/models/bubble.model';
import { BubbleService } from 'src/app/shared/bubble.service';

@Component({
  selector: 'app-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss']
})
export class BubbleComponent {

  @Input()
  bubble!: Bubble;

  constructor(
    private bubbleService: BubbleService
  ){}

  ngAfterViewInit(): void {
    this.move();
  }

  move(): void {
    setTimeout(() => {
      if (this.bubble.x < this.bubble.xEnd) this.bubble.x ++;
      else if (this.bubble.x > this.bubble.xEnd) this.bubble.x --;
      if (this.bubble.y < this.bubble.yEnd) this.bubble.y ++;
      else if (this.bubble.y > this.bubble.yEnd) this.bubble.y --;
      if (this.bubble.x !== this.bubble.xEnd || this.bubble.y !== this.bubble.yEnd) this.move();
      else this.bubbleService.removeBubble();
    }, 10);
  }

}
