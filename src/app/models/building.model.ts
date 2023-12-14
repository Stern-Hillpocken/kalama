export class Building {
    constructor(
        public name: string,
        public image: string,
        public life: number,
        public efficiency: number,
        public description: string,
        public type: "building"
    ){}
}