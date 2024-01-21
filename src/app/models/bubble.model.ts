export class Bubble {
    constructor(
        public image: string,
        public quantity: number,
        public width: number,
        public x: number,
        public y: number,
        public xEnd: number,
        public yEnd: number,
        public type: "positive" | "negative"
    ){}
}