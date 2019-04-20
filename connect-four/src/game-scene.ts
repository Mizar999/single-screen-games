import "phaser";
import { BoardCursor } from "./board-cursor";
import { TokenData } from "./token-data";

export class GameScene extends Phaser.Scene {
    private map: Phaser.Tilemaps.Tilemap;
    private boardLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private tokenLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private layerScale: number;

    private emptyTile: number;
    private borderTile: number;
    private tokenTile: number;

    private boardRect: Phaser.Geom.Rectangle;
    private cursor: BoardCursor;
    private tokens: [[{ player: number }?]?];
    private tokenData: TokenData;

    constructor() {
        super({
            key: "GameScene"
        });
    }

    init(params: any): void {
        this.layerScale = 0.5;
        this.emptyTile = 249;
        this.borderTile = 35;
        this.tokenTile = 7;
        this.boardRect = new Phaser.Geom.Rectangle(3, 5, 7, 7);
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
        this.tokenLayer = this.map.createBlankDynamicLayer("token", tileset);
        this.tokenLayer.setScale(this.layerScale);

        this.boardLayer.fill(this.borderTile, this.boardRect.x - 1, this.boardRect.y, this.boardRect.width + 2, this.boardRect.height + 1);
        this.boardLayer.fill(this.emptyTile, this.boardRect.x, this.boardRect.y, this.boardRect.width, this.boardRect.height);

        this.initializeCursor();
        this.initializeTokens();

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            let position = this.boardLayer.worldToTileXY(pointer.worldX, pointer.worldY);
            if (this.isValidCursorPosition(position.x)) {
                this.moveCursorTo(position.x);
            }
        }, this);

        this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            let position = this.boardLayer.worldToTileXY(pointer.worldX, pointer.worldY);
            if (this.isValidCursorPosition(position.x)) {
                this.dropToken(position.x, this.tokenData.fallDuration);
            }
        }, this);
    }

    update(time: number, delta: number): void {
        // TODO
    }

    private initializeCursor(): void {
        this.cursor = {
            x: this.boardRect.x,
            y: this.boardRect.y - 1,
            minX: this.boardRect.x,
            maxX: this.boardRect.x + this.boardRect.width - 1,
            isMoving: false,
            tileIndex: 31
        };
        this.boardLayer.putTileAt(this.cursor.tileIndex, this.cursor.x, this.cursor.y);
    }

    private initializeTokens(): void {
        this.tokenData = {
            fallDuration: 400,
            isMoving: false
        };
        this.tokens = [];
        for (let x = 0; x < this.boardRect.width; ++x) {
            this.tokens.push([]);
            for (let y = 0; y < this.boardRect.height; ++y) {
                this.tokens[x].push({ player: 0 });
            }
        }
    }

    private isValidCursorPosition(x: number): boolean {
        return x >= this.cursor.minX && x <= this.cursor.maxX;
    }

    private moveCursorTo(newX: number, duration: number = 1): void {
        let dirX = newX - this.cursor.x;
        if (!this.cursor.isMoving) {
            this.cursor.isMoving = true;
            this.moveTile(this.boardLayer, this.cursor.x, this.cursor.y, dirX, 0, duration, () => {
                this.cursor.x += dirX;
                this.cursor.isMoving = false;
            });
        }
    }

    private dropToken(x: number, duration: number = 1): void {
        if (!this.tokenData.isMoving) {
            this.tokenData.isMoving = true;
            let y = this.cursor.y + 1;
            let tokenX = x - this.boardRect.x;
            let dirY: number;
            for (dirY = this.boardRect.height - 1; dirY >= 0; --dirY) {
                if (this.tokens[tokenX][dirY].player === 0) {
                    break;
                }
            }

            if (dirY >= 0) {
                this.tokenLayer.putTileAt(this.tokenTile, x, y);
                this.moveTile(this.tokenLayer, x, y, 0, dirY, duration, () => {
                    this.tokens[tokenX][dirY].player = 1;
                    this.tokenData.isMoving = false;
                });
            } else {
                this.tokenData.isMoving = false;
            }
        }
    }

    private moveTile(layer: Phaser.Tilemaps.DynamicTilemapLayer, x: number, y: number, dirX: number, dirY: number, duration: number = 1, complete?: () => void): void {
        let tile = layer.getTileAt(x, y);
        if (tile && tile.index >= 0) {
            let destination = new Phaser.Geom.Point((x + dirX) * tile.width, (y + dirY) * tile.height);
            this.add.tween({
                targets: tile,
                pixelX: destination.x,
                pixelY: destination.y,
                duration: duration,
                ease: "Power2",
                onComplete: () => {
                    layer.removeTileAt(x, y);
                    layer.putTileAt(tile, x + dirX, y + dirY);
                    if (complete) {
                        complete();
                    }
                }
            });
        }
    }
}