import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { Tower } from '../models/tower.model';
import { Building } from '../models/building.model';
import { Character } from '../models/character.model';
import { Enemy } from '../models/enemy.model';
import { Router } from '@angular/router';
import { Resource } from '../models/resource.model';
import { MapState } from '../models/map-state.model';
import { InformationOf } from './information-of.service';
import { Relic } from '../models/relic.model';
import { Power } from '../models/power.model';
import { BubbleService } from './bubble.service';
import { Bubble } from '../models/bubble.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly _gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(new GameState("", 0, "", new MapState(0,0,0,0,0), [-1,-1], false, 0, 0, 0, 0, 0, new Power("","","",0), 0, [], [], [], [], [], [], [], 0, [], [[],[],[],[],[],[]]));

  private sacrificeResourceGain = {gem: 3, stone: 4, wood: 6};
  private repairResourceCost = {stone: 4, wood: 5};

  constructor(
    private router: Router,
    private informationOf: InformationOf,
    private bubbleService: BubbleService
  ) { }

  _getGameState$(): Observable<GameState> {
    return this._gameState$.asObservable();
  }

  _setGameState$(state: GameState): void {
    this._gameState$.next(state);
  }

  launchTuto(): void {
    this._setGameState$(new GameState("battle", 0, "preparation", new MapState(0,0,0,0,0), [-1,-1], false, 15, 0, 3, 2, 0, this.informationOf.getPowerWithName("dash"), 3, [], [], ["stone-cutter", "wood-cutter"], ["stone-cutter", "wood-cutter"], [], ["ram","ram","wall"], ["ram","ram","wall"], 0, ["","","","","worm","","worm"], [["","","","","",""],["","","","","",""],["",new Resource("wood", "Arbre", "wood", 1, "Du bois à récolter", "resource"),"","","",""],["","","","","",""],["","","","",new Resource("stone", "Roche", "stone", 2, "De la pierre à exploiter", "resource"),""],["","","","","",""]]));
  }

  endTurn(): void {
    this.upkeep();
    this.buildingsProduction();
    this.towersTrigger();
    this.moveEnemies();
    this.spawn();
    this.checkEndBattle();
  }

  upkeep(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.wave ++;
    if (newGameState.koCounter > 0) newGameState.koCounter --;
    if (newGameState.currentPowerCoolDown < newGameState.power.maxPowerCoolDown) newGameState.currentPowerCoolDown ++;
    //this._setGameState$(newGameState);
  }

  buildingsProduction(): void {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "building"){
          let building : Building = newGameState.grid[r][c];

          if (building.name === "wood-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "wood") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "wood"))){
            newGameState.wood += building.efficiency;
            let cStart: number = c;
            if (newGameState.grid[r][c-1].name === "wood") cStart = c-1;
            else cStart = c+1;
            this.bubbleService.addBubble(new Bubble(
              "wood",
              building.efficiency,
              this.getCoordinateFromRowColumn("w", r, c),
              this.getCoordinateFromRowColumn("x", r, cStart),
              this.getCoordinateFromRowColumn("y", r, cStart),
              this.getCoordinateFromRowColumn("x", r, c),
              this.getCoordinateFromRowColumn("y", r, c),
              "positive"
              ));
          } else if (building.name === "stone-cutter" && ((newGameState.grid[r][c-1] && newGameState.grid[r][c-1].name && newGameState.grid[r][c-1].name === "stone") || (newGameState.grid[r][c+1] && newGameState.grid[r][c+1].name && newGameState.grid[r][c+1].name === "stone"))){
            newGameState.stone += building.efficiency;
            let cStart: number = c;
            if (newGameState.grid[r][c-1].name === "stone") cStart = c-1;
            else cStart = c+1;
            this.bubbleService.addBubble(new Bubble(
              "stone",
              building.efficiency,
              this.getCoordinateFromRowColumn("w", r, c),
              this.getCoordinateFromRowColumn("x", r, cStart),
              this.getCoordinateFromRowColumn("y", r, cStart),
              this.getCoordinateFromRowColumn("x", r, c),
              this.getCoordinateFromRowColumn("y", r, c),
              "positive"
              ));
          }

        }
      }
    }
  }

  towersTrigger(): void {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "tower"){
          let tower: Tower = newGameState.grid[r][c];

          // trigger
          if (tower.sequence[tower.step] === "attack"){
            if (tower.tileTargeted.includes("top") && newGameState.grid[r-1][c] && newGameState.grid[r-1][c].type && newGameState.grid[r-1][c] && newGameState.grid[r-1][c].type === "enemy"){
              // Damage
              newGameState.grid[r-1][c].life -= tower.damage;
              this.bubbleService.addBubble(new Bubble(
                "attack",
                tower.damage,
                this.getCoordinateFromRowColumn("w", r, c),
                this.getCoordinateFromRowColumn("x", r-1, c),
                this.getCoordinateFromRowColumn("x", r-1, c),
                this.getCoordinateFromRowColumn("x", r, c),
                this.getCoordinateFromRowColumn("y", r, c),
                "positive"
                ));
              if (newGameState.grid[r-1][c].life <= 0) {
                newGameState.grid[r-1][c] = "";
                newGameState.gem ++;
              }
            }
          }
          // add step
          tower.step ++;
          if (tower.step >= tower.sequence.length) tower.step = 0;
          // change visual
          if(tower.sequence[tower.step] === "attack") tower.image = tower.name + "-engaged";
          else tower.image = tower.name;

        }
      }
    }
  }

  moveEnemies(): void {
    let newGameState: GameState = this._gameState$.getValue();
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        // For each cell
        if (newGameState.grid[r][c].moves && newGameState.grid[r][c].activeWave < newGameState.wave){
          if (newGameState.grid[r][c].moves[newGameState.grid[r][c].currentMoveStep] === "down"){
            if (r+1 >= newGameState.grid.length) {
              newGameState.structure -= newGameState.grid[r][c].damage;
              newGameState.grid[r][c] = "";
            } else if (newGameState.grid[r+1][c] === ""){
              newGameState.grid[r+1][c] = newGameState.grid[r][c];
              newGameState.grid[r+1][c] = this.enemyPreparationForNextTurn(newGameState.grid[r+1][c]);
              newGameState.grid[r][c] = "";
            } else if (newGameState.grid[r+1][c].type !== "enemy"){
              newGameState.grid[r+1][c].life -= newGameState.grid[r][c].damage;
              this.bubbleService.addBubble(new Bubble(
                "attack",
                newGameState.grid[r][c].damage,
                this.getCoordinateFromRowColumn("w", r, c),
                this.getCoordinateFromRowColumn("x", r, c),
                this.getCoordinateFromRowColumn("y", r, c),
                this.getCoordinateFromRowColumn("x", r+1, c),
                this.getCoordinateFromRowColumn("y", r+1, c),
                "negative"
              ));
              if (newGameState.grid[r+1][c].life <= 0){
                if (newGameState.grid[r+1][c].type === "character") {
                  newGameState.koCounter = newGameState.power.maxPowerCoolDown;
                  newGameState.characterPosition = [-1,-1];
                }
                newGameState.grid[r+1][c] = "";
              }
              newGameState.grid[r][c] = this.enemyPreparationForNextTurn(newGameState.grid[r][c]);
            }
          }
        }

      }
    }
  }

  enemyPreparationForNextTurn(gs: any): any {
    gs.currentMoveStep ++;
    gs.activeWave ++;
    if (gs.currentMoveStep >= gs.moves.length) gs.currentMoveStep = 0;
    return gs;
  }

  random(min: number, max: number): number{
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  spawn(): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.wave >= newGameState.spawnStrip.length || newGameState.spawnStrip[newGameState.wave] === "") return;

    let emptySpaces: number[] = [];
    let rowToSpawn: number = 0;

    for (let i = 0; i < newGameState.grid[0].length; i++){
      if(newGameState.grid[0][i] === "") emptySpaces.push(i);
    }
    if (emptySpaces.length === 0) {
      rowToSpawn = 1;
      for (let i = 0; i < newGameState.grid[1].length; i++){
        if(newGameState.grid[1][i] === "") emptySpaces.push(i);
      }
    }

    let randomSpotChoosed = emptySpaces[this.random(0, emptySpaces.length-1)];

    let newEnemy: Enemy = this.informationOf.getWithNameType(newGameState.spawnStrip[newGameState.wave], "enemy");
    newGameState.grid[rowToSpawn][randomSpotChoosed] = new Enemy(newEnemy.name, newEnemy.title, newEnemy.image, newEnemy.life, newEnemy.currentMoveStep, newEnemy.moves, newEnemy.activeWave, newEnemy.damage, newEnemy.description, "enemy");
    newGameState.grid[rowToSpawn][randomSpotChoosed].activeWave = newGameState.wave;
    this._setGameState$(newGameState);
  }

  placeConstruction(name: string, position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.grid[position[0]][position[1]] !== "") return;

    if (name === "character" && newGameState.koCounter === 0) {
      newGameState.grid[position[0]][position[1]] = new Character("character", "Votre personnage", "character", 1, 1, "C'est vous !", "character");
      newGameState.characterPosition = [position[0],position[1]];
      return;
    }

    for (let i = 0; i < newGameState.buildingsAvailable.length; i++){
      if (newGameState.buildingsAvailable[i] === name){
        newGameState.buildingsAvailable.splice(i,1);
        let newBuilding: Building = this.informationOf.getWithNameType(name, "building");
        newGameState.grid[position[0]][position[1]] = new Building(newBuilding.name, newBuilding.title, newBuilding.image, newBuilding.life, newBuilding.efficiency, newBuilding.description, newBuilding.gemCost, newBuilding.stoneCost, newBuilding.woodCost, "building");
        return;
      }
    }

    for (let i = 0; i < newGameState.towersAvailable.length; i++){
      if (newGameState.towersAvailable[i] === name){
        if (this.isDiagonallyNearByCharacter(position)){
          newGameState.towersAvailable.splice(i,1);
          let newTower: Tower = this.informationOf.getWithNameType(name, "tower");
          newGameState.grid[position[0]][position[1]] = new Tower(newTower.name, newTower.title, newTower.image, newTower.life, newTower.damage, newTower.sequence, newTower.step, newTower.tileTargeted, newTower.description, newTower.gemCost, newTower.stoneCost, newTower.woodCost, "tower");
          this.endTurn();
          return;
        }
      }
    }
  }

  isDiagonallyNearByCharacter(position: number[]): boolean {
    let charPos: number[] = this._gameState$.getValue().characterPosition;
    if (Math.abs(position[0] - charPos[0]) <= 1 && Math.abs(position[1] - charPos[1]) <= 1) return true;
    return false;
  }

  moveCharacter(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.status === "preparation") return;

    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].name && newGameState.grid[r][c].name === "character"){
          if (newGameState.grid[position[0]][position[1]] === ""){
            newGameState.grid[position[0]][position[1]] = newGameState.grid[r][c];
            newGameState.characterPosition = [position[0],position[1]];
            newGameState.grid[r][c] = "";
          } else if (newGameState.grid[position[0]][position[1]].type && newGameState.grid[position[0]][position[1]].type === "enemy") {
            // Damage
            newGameState.grid[position[0]][position[1]].life -= newGameState.grid[r][c].damage;
            this.bubbleService.addBubble(new Bubble(
              "attack",
              newGameState.grid[r][c].damage,
              this.getCoordinateFromRowColumn("w", r, c),
              this.getCoordinateFromRowColumn("x", r, c),
              this.getCoordinateFromRowColumn("y", r, c),
              this.getCoordinateFromRowColumn("x", position[0], position[1]),
              this.getCoordinateFromRowColumn("y", position[0], position[1]),
              "positive"
            ));
            if(newGameState.grid[position[0]][position[1]].life <= 0) {
              newGameState.grid[position[0]][position[1]] = "";
              newGameState.gem ++;
            }
          }
          this.endTurn();
          return;
        }
      }
    }
  }

  checkEndBattle(): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.wave < newGameState.spawnStrip.length) return;
    for (let r = 0; r < newGameState.grid.length; r++){
      for (let c = 0; c < newGameState.grid[r].length; c++){
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "enemy") return;
      }
    }
    
    newGameState.display = "map";
    // End of tuto
    if (newGameState.difficulty < 1) this.router.navigateByUrl("");
  }

  powerDash(position: number[]): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.currentPowerCoolDown < newGameState.power.maxPowerCoolDown) return;
    if (newGameState.grid[position[0]][position[1]] === ""){
      newGameState.grid[position[0]][position[1]] = newGameState.grid[newGameState.characterPosition[0]][newGameState.characterPosition[1]];
      newGameState.grid[newGameState.characterPosition[0]][newGameState.characterPosition[1]] = "";
      newGameState.characterPosition = [position[0],position[1]];
      newGameState.currentPowerCoolDown = -1;
      this.endTurn();
    }
  }

  powerTowerReload() {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.currentPowerCoolDown < newGameState.power.maxPowerCoolDown) return;
    for (let r = 0; r < newGameState.grid.length; r++) {
      for (let c = 0; c < newGameState.grid[r].length; c++) {
        if (newGameState.grid[r][c].type && newGameState.grid[r][c].type === "tower") newGameState.grid[r][c].step = 0;
      }
    }
    newGameState.currentPowerCoolDown = -1;
    this.endTurn();
  }

  isPositionExistIn(position: number[], array: number[][]): boolean {
    for (let i = 0; i < array.length; i++) {
      if (position[0] === array[i][0] && position[1] === array[i][1]) return true;
    }
    return false;
  }

  generateBattle(type: "boss" | "battle" | "elite"): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.characterPosition = [-1,-1];
    newGameState.status = "preparation";
    newGameState.koCounter = 0;
    newGameState.currentPowerCoolDown = newGameState.power.maxPowerCoolDown;
    // Decrease event count
    if (type === "battle") newGameState.mapState.battleCount --;
    else if (type === "elite") newGameState.mapState.eliteCount --;
    // Building preparation
    newGameState.buildingsAvailable = [];
    for (let i = 0; i < newGameState.buildingsUnlocked.length; i++) {
      newGameState.buildingsAvailable.push(newGameState.buildingsUnlocked[i]);
    }
    // Tower preparation
    newGameState.towersAvailable = [];
    for (let i = 0; i < newGameState.towersUnlocked.length; i++) {
      newGameState.towersAvailable.push(newGameState.towersUnlocked[i]);
    }

    // Map generation
    newGameState.grid = [];
    let mapHeight: number = 6;
    let mapWidth: number = 6;
    // Wood and stone
    let resourceCount = this.random(3,5);
    if (type === 'elite') resourceCount = 2;
    else if (type === 'boss') resourceCount = 0;
    let resourcePosition: number[][] = [];
    let resourceName: string[] = [];
    while (resourceName.length < resourceCount) {
      // Position
      let randomResourcePosition: number[] = [this.random(1,mapHeight-1), this.random(0,mapWidth-1)];
      while (this.isPositionExistIn(randomResourcePosition, resourcePosition)) {
        randomResourcePosition = [this.random(1,mapHeight-1), this.random(0,mapWidth-1)];
      }
      resourcePosition.push(randomResourcePosition);
      // Name
      if (resourceName.length === 0) resourceName.push("wood");
      else if (resourceName.length === 1) resourceName.push("stone");
      else this.random(0,1) === 0 ? resourceName.push("wood") : resourceName.push("stone");
    }

    // Blank creation
    for (let r = 0; r < mapHeight; r++) {
      let row = [];
      for (let c = 0; c < mapWidth; c++) {
        row.push("");
      }
      newGameState.grid.push(row);
    }
    // Resource placement
    for (let i = 0; i < resourcePosition.length; i++) {
      if (resourceName[i] === "wood") newGameState.grid[resourcePosition[i][0]][resourcePosition[i][1]] = new Resource("wood", "Arbre", "wood", 1, "Du bois", "resource");
      else if (resourceName[i] === "stone") newGameState.grid[resourcePosition[i][0]][resourcePosition[i][1]] = new Resource("stone", "Roche", "stone", 3, "De la pierre", "resource");
    }

    // Waves preparation
    newGameState.wave = 0;
    newGameState.spawnStrip = [];
    let stripLength: number = this.random(6, 20);
    for (let i = 0; i < stripLength; i++) {
      newGameState.spawnStrip.push("");
    }
    let enemiesCount: number = Math.floor(stripLength/3);
    while (enemiesCount !== 0) {
      let randomSpawnTime = this.random(1,stripLength-1);
      if (newGameState.spawnStrip[randomSpawnTime] === "") {
        newGameState.spawnStrip[randomSpawnTime] = "worm";
        enemiesCount --;
      }
    }
    newGameState.spawnStrip[stripLength-1] = "worm";

    newGameState.display = "battle";
  }

  generateShelter(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.display = "shelter";
    newGameState.mapState.shelterCount --;
  }

  generateSeller(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.display = "seller";
    newGameState.mapState.sellerCount --;
  }

  getSacrificeResourceGain(resource: "gem" | "stone" | "wood"): number {
    return this.sacrificeResourceGain[resource];
  }

  getRepairResourceCost(resource: "stone" | "wood"): number {
    return this.repairResourceCost[resource];
  }

  sacrificeFor(resource: "gem" | "stone" | "wood"): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.structure > 1) {
      newGameState.structure --;
      newGameState[resource] += this.sacrificeResourceGain[resource];
    }
  }

  shelterBuild(type: "building" | "tower", name: string): void {
    let newGameState: GameState = this._gameState$.getValue();
    let typeUnlocked = type+"sUnlocked" as "buildingsUnlocked" | "towersUnlocked";
    if (this.informationOf.getWithNameType(name, type).stoneCost > newGameState.stone || this.informationOf.getWithNameType(name, type).woodCost > newGameState.wood) return;

    newGameState.stone -= this.informationOf.getWithNameType(name, type).stoneCost;
    newGameState.wood -= this.informationOf.getWithNameType(name, type).woodCost;
    newGameState[typeUnlocked].push(name);
    newGameState[typeUnlocked] = newGameState[typeUnlocked].sort();
  }

  backToMap(): void {
    let newGameState: GameState = this._gameState$.getValue();
    newGameState.display = "map";
  }

  getBuildingsToSell(): Building[] {
    let count: number = this.random(0,1);
    if (count === 0) return [];
    let buildings: Building[] = [];
    let allBuildings: Building[] = this.informationOf.getAllBuildings();

    for (let i = 0; i < count; i++) {
      let randomIndex: number = this.random(0, allBuildings.length-1);
      buildings.push(allBuildings[randomIndex]);
    }

    return buildings;
  }

  getTowersToSell(): Tower[] {
    let count: number = this.random(1,2);
    let towers: Tower[] = [];
    let allTowers = this.informationOf.getAllTowers();

    while (towers.length < count) {
      let randomIndex: number = this.random(0, allTowers.length-1);
      if (!towers.includes(allTowers[randomIndex])) towers.push(allTowers[randomIndex]);
    }

    return towers;    
  }

  learnBlueprint(name: string, type: "building" | "tower"): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (type === "building") {
      let allBuildings: Building[] = this.informationOf.getAllBuildings();
      let nameExist: boolean = false;
      let price: number | undefined;
      for (let i = 0; i < allBuildings.length; i++) {
        if (allBuildings[i].name === name) {
          nameExist = true;
          price = allBuildings[i].gemCost;
          break;
        }
      }
      if (!nameExist) return;
      if (typeof price == 'undefined' || price > newGameState.gem) return;
      for (let i = 0; i < newGameState.buildingsBlueprints.length; i++) {
        if (newGameState.buildingsBlueprints[i] === name) return;
      }
      newGameState.buildingsBlueprints.push(name);
      newGameState.gem -= price;
    } else {
      let allTowers: Tower[] = this.informationOf.getAllTowers();
      let nameExist: boolean = false;
      let price: number | undefined = undefined;
      for (let i = 0; i < allTowers.length; i++) {
        if (allTowers[i].name === name) {
          nameExist = true;
          price = allTowers[i].gemCost;
          break;
        }
      }
      if (!nameExist) return;
      if (typeof price == 'undefined' || price > newGameState.gem) return;
      for (let i = 0; i < newGameState.towersBlueprints.length; i++) {
        if (newGameState.towersBlueprints[i] === name) return;
      }
      newGameState.towersBlueprints.push(name);
      newGameState.gem -= price;
    }
  }

  getRelicsToSell(): Relic[] {
    let quantity: number = this.random(1,3);
    let relicsToSell: Relic[] = [];
    let allRelics: Relic[] = this.informationOf.getAllRelics();
    for (let i = 0; i < quantity; i++) {
      let randomIndex: number = this.random(0, allRelics.length-1);
      relicsToSell.push(allRelics[randomIndex]);
    }
    return relicsToSell;
  }

  buyRelic(name: string): void {
    let newGameState: GameState = this._gameState$.getValue();
    let allRelics: Relic[] = this.informationOf.getAllRelics();
    for (let i = 0; i < allRelics.length; i++) {
      if (allRelics[i].name === name && allRelics[i].gemCost <= newGameState.gem) {
        newGameState.relics.push(allRelics[i]);
        newGameState.gem -= allRelics[i].gemCost;
      }
    }
  }

  repair(): void {
    let newGameState: GameState = this._gameState$.getValue();
    if (newGameState.stone >= this.repairResourceCost["stone"] && newGameState.wood >= this.repairResourceCost["wood"]){
      newGameState.stone -= this.repairResourceCost["stone"];
      newGameState.wood -= this.repairResourceCost["wood"];
      newGameState.structure ++;
    }
  }

  getCoordinateFromRowColumn(wxy: "w" | "x" | "y", r: number, c: number): number {
    let cellHeight = document.getElementById("grid")?.getElementsByClassName("object")[0]?.getElementsByTagName("tr")[r]?.getElementsByTagName("td")[c]?.style.height;
    let coord: number = -1;
    if (wxy === "w" && typeof(cellHeight) === 'string') coord = parseInt(cellHeight);
    else if (wxy === "x" && typeof(cellHeight) === 'string') coord = parseInt(cellHeight) * c;
    else if (wxy === "y" && typeof(cellHeight) === 'string') coord = parseInt(cellHeight) * r;
    return coord;
  }

}
