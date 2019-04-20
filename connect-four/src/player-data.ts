export class PlayerData {
    private activePlayer: number;
    private tints: number[];

    constructor() {
        this.activePlayer = 1;
        this.tints = [0x3643f4, 0x3bebff];
    }

    getActivePlayer(): number {
        return this.activePlayer;
    }

    getTint(): number {
        return this.tints[this.activePlayer - 1];
    }

    nextPlayer(): void {
        this.activePlayer += 1;
        if (this.activePlayer > this.tints.length) {
            this.activePlayer = 1;
        }
    }
}