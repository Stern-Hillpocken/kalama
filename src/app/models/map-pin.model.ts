export class MapPin {
    constructor(
        public battlePosition: number[][],
        public shelterPosition: number[][],
        public elitePosition: number[][],
        public sellerPosition: number[][],
        public spotName: string[],
        public spotPosition: number[][]
    ){}
}