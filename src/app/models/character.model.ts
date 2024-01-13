export class Character {
    constructor(
        public name: string,
        public title: string,
        public image: string,
        public life: number,
        public damage: number,
        public description: string,
        public type: "character"
    ){}
}