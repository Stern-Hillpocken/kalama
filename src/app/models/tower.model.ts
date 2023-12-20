export class Tower {
    constructor(
        public name: string,
        public image: string,
        public life: number,
        public damage: number,
        public sequence: string[],
        public step: number,
        public tileTargeted: string,
        public description: string,
        public type: string
    ){}
}