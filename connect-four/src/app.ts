import "phaser";

const config: GameConfig = {
    title: "Connect Four",
    width: 800,
    height: 600,
    parent: "game",
    backgroundColor: "#999999"
}

export class ConnectFourGame extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.onload = () => {
    var game = new ConnectFourGame(config);
}