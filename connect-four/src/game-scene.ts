import "phaser";
import { Curves } from "phaser";

export class GameScene extends Phaser.Scene {
    private map: Phaser.Tilemaps.Tilemap;
    private boardLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private layerScale: number;

    private emptyTile: number;
    private borderTile: number;

    private cursor: { x: number, y: number, isMoving: boolean, tileIndex: number };

    constructor() {
        super({
            key: "GameScene"
        });
    }

    init(params: any): void {
        this.layerScale = 0.5;
        this.emptyTile = 46;
        this.borderTile = 35;
        this.cursor = {
            x: 0, y: 0, isMoving: false, tileIndex: 31
        };
    }

    preload(): void {
        this.load.setBaseURL("../assets/");
        this.load.image("tiles", "hack_square_64x64.png");
    }

    create(): void {
        this.map = this.make.tilemap({ tileWidth: 64, tileHeight: 64, width: 20, height: 15 });
        let tileset = this.map.addTilesetImage("tiles");

        this.boardLayer = this.map.createBlankDynamicLayer("board", tileset);
        this.boardLayer.setScale(this.layerScale);

        let x = 2;
        let y = 5;
        this.cursor.x = x + 1;
        this.cursor.y = y - 1;
        this.boardLayer.fill(this.borderTile, x, y, 9, 8);
        this.boardLayer.fill(this.emptyTile, x + 1, y, 7, 7);
        this.boardLayer.putTileAt(this.cursor.tileIndex, this.cursor.x, this.cursor.y);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.cursor.isMoving) {
                    this.cursor.isMoving = true;
                    this.moveTile("board", this.cursor.x, this.cursor.y, 1, 0, 300, () => {
                        this.cursor.x += 1;
                        this.cursor.isMoving = false;
                    });
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    update(time: number, delta: number): void {
        // TODO
    }

    private moveTile(layerName: string, x: number, y: number, dirX: number, dirY: number, duration: number = 1, complete?: () => void): void {
        let currentLayerName = this.map.getLayer().name;
        this.map.setLayer(layerName);

        let tile = this.map.getTileAt(x, y);
        if (tile && tile.index >= 0) {
            let destination = new Phaser.Geom.Point((x + dirX) * tile.width, (y + dirY) * tile.height);
            this.add.tween({
                targets: tile,
                pixelX: destination.x,
                pixelY: destination.y,
                duration: duration,
                ease: "Power2",
                onComplete: () => {
                    this.map.removeTileAt(x, y);
                    this.map.putTileAt(tile.index, x + dirX, y + dirY);
                    if (complete) {
                        complete();
                    }
                }
            });
        }

        this.map.setLayer(currentLayerName);
    }
}