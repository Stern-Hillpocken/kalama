import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PopupMessage } from '../models/popup-message.model';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  private readonly _popupMessage$: BehaviorSubject<PopupMessage> = new BehaviorSubject<PopupMessage>(new PopupMessage("","",""));

  constructor() { }

  _getMessage$(): Observable<PopupMessage> {
    return this._popupMessage$.asObservable();
  }

  _setMessage$(msg: PopupMessage): void {
    this._popupMessage$.next(msg);
  }

  removeMessage(): void {
    this._popupMessage$.next(new PopupMessage("","",""));
  }

}
