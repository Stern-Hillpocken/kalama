export class Enemy {
    constructor(
        public name: string,
        public image: string,
        public life: number,

        public currentMoveStep: number,
        public moves: string[],

        public activeWave: number,

        public damage: number,

        public type: "enemy"
    ){}
}