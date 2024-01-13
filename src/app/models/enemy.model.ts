export class Enemy {
    constructor(
        public name: string,
        public title: string,
        public image: string,
        public life: number,

        public currentMoveStep: number,
        public moves: string[],

        public activeWave: number,

        public damage: number,

        public description: string,
        public type: "enemy"
    ){}
}