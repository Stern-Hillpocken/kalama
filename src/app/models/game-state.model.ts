import { MapState } from "./map-state.model";

export class GameState {
    constructor(
        public display: string,
        public difficulty: number,
        public status: string,
        public mapState: MapState,

        public characterPosition: number[],
        public isBattleLifeDisplayed: boolean,

        public structure: number,
        public koCounter: number,
        public wood: number,
        public stone: number,
        public gem: number,
        public power: string,
        public currentPowerCoolDown: number,
        public maxPowerCoolDown: number,
        public relics: string[],

        public buildingsBlueprints: string[],
        public buildingsAvailable: string[],
        public buildingsUnlocked: string[],
        public towersBlueprints: string[],
        public towersAvailable: string[],
        public towersUnlocked: string[],

        public wave: number,
        public spawnStrip: string[],
        public grid: any[][]
    ){}
}