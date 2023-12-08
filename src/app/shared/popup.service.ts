import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PopupMessage } from '../models/popup-message.model';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  private readonly _popupMessageList$: BehaviorSubject<PopupMessage[]> = new BehaviorSubject<PopupMessage[]>([]);

  constructor() { }

  _getMessage$(): Observable<PopupMessage[]> {
    return this._popupMessageList$.asObservable();
  }

  _setMessage$(msg: PopupMessage[]): void {
    this._popupMessageList$.next(msg);
  }

  remove(): void {
    this._popupMessageList$.next([]);
  }

}
