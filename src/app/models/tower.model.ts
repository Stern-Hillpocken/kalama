export class Tower {
    constructor(
        public name: string,
        public image: string,
        public life: number,
        public damage: number,
        public state: string[],
        public step: number,
        public spot: string,
        public type: string
    ){}
}