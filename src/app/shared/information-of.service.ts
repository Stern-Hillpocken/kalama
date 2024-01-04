import { Injectable } from '@angular/core';
import { Tower } from '../models/tower.model';
import { Building } from '../models/building.model';
import { HttpClient } from '@angular/common/http';
import { Enemy } from '../models/enemy.model';

@Injectable({
  providedIn: 'root'
})
export class InformationOf {

  private allEnemies: Enemy[] = [];
  private allBuildings: Building[] = [];
  private allTowers: Tower[] = [];

  constructor(
    private http: HttpClient
  ) {
    this.http.get('assets/json/enemies.json').subscribe((json: any) => {
        for (let i = 0; i < json.length; i++){
            this.allEnemies.push(new Enemy(json[i].name, json[i].image, json[i].life, 0, json[i].moves, 0, json[i].damage, json[i].description, "enemy"));
        }
    });
    this.http.get('assets/json/buildings.json').subscribe((json: any) => {
      for (let i = 0; i < json.length; i++){
          this.allBuildings.push(new Building(json[i].name, json[i].image, json[i].life, json[i].efficiency, json[i].description, json[i].gemCost, json[i].stoneCost, json[i].woodCost, "building"));
      }
    });
    this.http.get('assets/json/towers.json').subscribe((json: any) => {
      for (let i = 0; i < json.length; i++){
          this.allTowers.push(new Tower(json[i].name, json[i].image, json[i].life, json[i].damage, json[i].sequence, 0, json[i].tileTargeted, json[i].description, json[i].gemCost, json[i].stoneCost, json[i].woodCost, "tower"));
      }
    });
  }

  getAllBuildings(): Building[] {
    return this.allBuildings;
  }

  getAllTowers(): Tower[] {
    return this.allTowers;
  }

  getWithNameType(name: string, type: "enemy" | "building" | "tower" | "relic"): any {
    if (type === "enemy") {
      for (let i = 0; i < this.allEnemies.length; i++) {
        if (this.allEnemies[i].name === name) return this.allEnemies[i];
      }
    } else if (type === "building") {
      for (let i = 0; i < this.allBuildings.length; i++) {
        if (this.allBuildings[i].name === name) return this.allBuildings[i];
      }
    } else if (type === "tower") {
      for (let i = 0; i < this.allTowers.length; i++) {
        if (this.allTowers[i].name === name) return this.allTowers[i];
      }
    }
    return {name:"error"};
  }

}
