import { GameScene } from "./game-scene";
import {Types, Game} from "phaser";

const config: Types.Core.GameConfig = {
    title: "Connect Four",
    width: 800,
    height: 600,
    parent: "game",
    scene: [GameScene],
    backgroundColor: "#999999"
}

export class ConnectFourGame extends Game {
    constructor(config: Types.Core.GameConfig) {
        super(config);
    }
}

window.onload = () => {
    var game = new ConnectFourGame(config);
}