export class GameState {
    constructor(
        public display: string,
        public difficulty: number,

        public structure: number,
        public koCounter: number,
        public wood: number,
        public stone: number,
        public gem: number,
        public power: string,
        public currentPowerCoolDown: number,
        public maxPowerCoolDown: number,
        public relics: string[],

        public buildingsAvailable: string[],
        public buildingsUnlocked: string[],
        public towersAvailable: string[],
        public towersUnlocked: string[],

        public wave: number,
        public spawnStrip: string[],
        public grid: string[][]
    ){}
}