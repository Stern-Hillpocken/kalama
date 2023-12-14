export class Resource {
    constructor(
        public name: string,
        public image: string,
        public life: number,
        public description: string,
        public type: "resource"
    ){}
}