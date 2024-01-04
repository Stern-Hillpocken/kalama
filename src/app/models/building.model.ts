export class Building {
    constructor(
        public name: string,
        public image: string,
        public life: number,
        public efficiency: number,
        public description: string,
        public gemCost: number,
        public stoneCost: number,
        public woodCost: number,
        public type: "building"
    ){}
}