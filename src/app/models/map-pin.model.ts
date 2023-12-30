export class MapPin {
    constructor(
        public battlePosition: number[][],
        public campPosition: number[][],
        public elitePosition: number[][],
        public sellerPosition: number[][],
        public spotName: string[],
        public spotPosition: number[][]
    ){}
}