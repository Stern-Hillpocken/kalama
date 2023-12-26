import { Injectable } from '@angular/core';
import { Tower } from '../models/tower.model';
import { Building } from '../models/building.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InformationOf {

  private allTowers: Tower[] = [];
  private allBuildings: Building[] = [];

  constructor(
    private http: HttpClient
  ) {
    this.http.get('assets/json/towers.json').subscribe((json: any) => {
        for (let i = 0; i < json.length; i++){
            this.allTowers.push(new Tower(json[i].name, json[i].name, json[i].life, json[i].damage, json[i].sequence, 0, json[i].tileTargeted, json[i].description, "tower"));
        }
    });
  }

  getWithName(name: string): any {
    for (let i = 0; i < this.allTowers.length; i++) {
        if (this.allTowers[i].name === name) return this.allTowers[i];
    }
  }

}
