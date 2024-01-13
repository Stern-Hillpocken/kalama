export class Tower {
    constructor(
        public name: string,
        public title: string,
        public image: string,
        public life: number,
        public damage: number,
        public sequence: string[],
        public step: number,
        public tileTargeted: string,
        public description: string,
        public gemCost: number,
        public stoneCost: number,
        public woodCost: number,
        public type: string
    ){}
}