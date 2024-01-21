import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bubble } from '../models/bubble.model';

@Injectable({
    providedIn: 'root'
})
export class BubbleService {

    private readonly _bubble$: BehaviorSubject<Bubble[]> = new BehaviorSubject<Bubble[]>([]);

    _getGameState$(): Observable<Bubble[]> {
        return this._bubble$.asObservable();
    }
    
    _setGameState$(state: Bubble[]): void {
        this._bubble$.next(state);
    }

    addBubble(bubble: Bubble): void {
        let oldBubbles: Bubble[] = this._bubble$.getValue();
        oldBubbles.push(bubble);
    }

    removeBubble(): void {
        let oldBubbles: Bubble[] = this._bubble$.getValue();
        oldBubbles.shift();
    }

    reset(): void {
        this._setGameState$([]);
    }

}
