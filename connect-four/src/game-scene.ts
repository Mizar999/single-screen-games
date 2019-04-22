import "phaser";
import { BoardCursor } from "./board-cursor";
import { TokenData } from "./token-data";
import { PlayerData } from "./player-data";

export class GameScene extends Phaser.Scene {
    private map: Phaser.Tilemaps.Tilemap;
    private boardLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private tokenLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private layerScale: number;

    private emptyTile: number;
    private borderTile: number;
    private tokenTile: number;

    private boardRect: Phaser.Geom.Rectangle;
    private borderTiles: Phaser.Tilemaps.Tile[];
    private cursor: BoardCursor;
    private tokens: [[{ player: number }?]?];
    private tokenData: TokenData;
    private players: PlayerData;
    private winnerTint: number;
    private changeBorderColorDuration: number;

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
        this.winnerTint = 0x4ac38b;
        this.changeBorderColorDuration = 700;
    }

    preload(): void {
        this.load.setBaseURL("../assets/");
        this.load.image("tiles-extruded", "hack_square_64x64_extruded.png");
    }

    create(): void {
        this.map = this.make.tilemap({ tileWidth: 64, tileHeight: 64, width: 20, height: 15 });
        let tileset = this.map.addTilesetImage("tiles", "tiles-extruded", 64, 64, 1, 2);

        this.boardLayer = this.map.createBlankDynamicLayer("board", tileset);
        this.boardLayer.setScale(this.layerScale);
        this.tokenLayer = this.map.createBlankDynamicLayer("token", tileset);
        this.tokenLayer.setScale(this.layerScale);

        this.boardLayer.fill(this.emptyTile, this.boardRect.x, this.boardRect.y, this.boardRect.width, this.boardRect.height);

        this.players = new PlayerData();
        this.initializeCursor();
        this.initializeTokens();
        this.initializeBorder();
        this.changeBorderColor(this.changeBorderColorDuration);

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            let position = this.boardLayer.worldToTileXY(pointer.worldX, pointer.worldY);
            if (this.isValidCursorPosition(position.x)) {
                this.moveCursorTo(position.x);
            }
        }, this);

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
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

    private initializeBorder(): void {
        this.borderTiles = [];
        let left = this.boardRect.x - 1;
        let right = this.boardRect.x + this.boardRect.width;
        let bottom = this.boardRect.y + this.boardRect.height;
        for (let y = this.boardRect.y; y < bottom; ++y) {
            this.borderTiles.push(this.boardLayer.putTileAt(this.borderTile, left, y));
            this.borderTiles.push(this.boardLayer.putTileAt(this.borderTile, right, y));
        }
        for (let x = left; x < right + 1; ++x) {
            this.borderTiles.push(this.boardLayer.putTileAt(this.borderTile, x, bottom));
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
            // Calculate how far the token can fall
            let dirY: number;
            for (dirY = this.boardRect.height - 1; dirY >= 0; --dirY) {
                if (this.tokens[tokenX][dirY].player === 0) {
                    break;
                }
            }

            if (dirY >= 0) {
                let tile = this.tokenLayer.putTileAt(this.tokenTile, x, y);
                tile.tint = this.players.getTint();
                this.moveTile(this.tokenLayer, x, y, 0, dirY, duration, () => {
                    this.tokens[tokenX][dirY].player = this.players.getActivePlayer();
                    if (!this.activePlayerHasWon()) {
                        this.players.nextPlayer();
                        this.changeBorderColor(this.changeBorderColorDuration);
                        this.tokenData.isMoving = false;
                    }
                });
            } else {
                this.tokenData.isMoving = false;
            }
        }
    }

    private changeBorderColor(duration: number = 1): void {
        let fromColor = Phaser.Display.Color.IntegerToColor(0xffffff);
        let toColor = Phaser.Display.Color.IntegerToColor(this.players.getTint());
        this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: duration,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                let tint = Phaser.Display.Color.Interpolate.ColorWithColor(
                    fromColor,
                    toColor,
                    100,
                    tween.getValue()
                );
                let tintColor = Phaser.Display.Color.ObjectToColor(tint).color;
                for (let index = 0; index < this.borderTiles.length; ++index) {
                    this.borderTiles[index].tint = tintColor;
                }
            }
        });
    }

    private activePlayerHasWon(): boolean {
        let result: { hasWon: boolean, positions: Phaser.Geom.Point[] };
        let step = 0;
        do {
            switch (step) {
                case 0:
                    result = this.checkHorizontal();
                    break;
                case 1:
                    result = this.checkVertical();
                    break;
                case 2:
                    result = this.checkDiagonal();
                    break;
            }
            step += 1;
        } while (!result.hasWon && step < 3);


        if (result.hasWon) {
            let tile: Phaser.Tilemaps.Tile;
            let tilePosition = new Phaser.Geom.Point();
            for (let index = 0; index < result.positions.length; ++index) {
                tilePosition.x = this.boardRect.x + result.positions[index].x;
                tilePosition.y = this.boardRect.y + result.positions[index].y;
                tile = this.tokenLayer.getTileAt(tilePosition.x, tilePosition.y)
                tile.tint = this.winnerTint;
            }
        }

        return result.hasWon;
    }

    private checkHorizontal(): { hasWon: boolean, positions: Phaser.Geom.Point[] } {
        let positions: Phaser.Geom.Point[] = [];
        for (let i = 0; i < 4; ++i) {
            positions.push(new Phaser.Geom.Point());
        }

        let hasWon = false;
        let count: number;
        let result: { hasWon: boolean, position: Phaser.Geom.Point, count: number };
        for (let y = 0; y < this.boardRect.height && !hasWon; ++y) {
            count = 0;
            for (let x = 0; x < this.boardRect.width && !hasWon; ++x) {
                result = this.checkWinningToken(x, y, count);
                positions[count] = result.position;
                count = result.count;
                hasWon = result.hasWon;
            }
        }

        return { hasWon: hasWon, positions: positions };
    }

    private checkVertical(): { hasWon: boolean, positions: Phaser.Geom.Point[] } {
        let positions: Phaser.Geom.Point[] = [];
        for (let i = 0; i < 4; ++i) {
            positions.push(new Phaser.Geom.Point());
        }

        let hasWon = false;
        let count: number;
        let result: { hasWon: boolean, position: Phaser.Geom.Point, count: number };
        for (let x = 0; x < this.boardRect.width && !hasWon; ++x) {
            count = 0;
            for (let y = 0; y < this.boardRect.height && !hasWon; ++y) {
                result = this.checkWinningToken(x, y, count);
                positions[count] = result.position;
                count = result.count;
                hasWon = result.hasWon;
            }
        }

        return { hasWon: hasWon, positions: positions };
    }

    private checkDiagonal(): { hasWon: boolean, positions: Phaser.Geom.Point[] } {
        let positions: Phaser.Geom.Point[] = [];
        for (let i = 0; i < 4; ++i) {
            positions.push(new Phaser.Geom.Point());
        }

        let activePlayer = this.players.getActivePlayer();
        let hasWon = false;
        let count: number;
        let result: { hasWon: boolean, position: Phaser.Geom.Point, count: number };
        let currentX: number;
        let currentY: number;
        for (let x = 0; x < this.boardRect.width && !hasWon; ++x) {
            count = 0;
            currentX = x;
            for (let y = 0; currentX < this.boardRect.width && y < this.boardRect.height && !hasWon; ++currentX, ++y) {
                result = this.checkWinningToken(currentX, y, count);
                positions[count] = result.position;
                count = result.count;
                hasWon = result.hasWon;
            }

            count = 0;
            currentX = this.boardRect.width - x - 1;
            for (let y = 0; currentX >= 0 && y < this.boardRect.height && !hasWon; --currentX, ++y) {
                result = this.checkWinningToken(currentX, y, count);
                positions[count] = result.position;
                count = result.count;
                hasWon = result.hasWon;
            }
        }

        for (let y = 1; y < this.boardRect.height && !hasWon; ++y) {
            count = 0;
            currentY = y;
            for (let x = 0; currentY < this.boardRect.height && x < this.boardRect.width && !hasWon; ++currentY, ++x) {
                result = this.checkWinningToken(x, currentY, count);
                positions[count] = result.position;
                count = result.count;
                hasWon = result.hasWon;
            }

            count = 0;
            currentY = y;
            for (let x = this.boardRect.width - 1; currentY < this.boardRect.height && x >= 0 && !hasWon; ++currentY, --x) {
                result = this.checkWinningToken(x, currentY, count);
                positions[count] = result.position;
                count = result.count;
                hasWon = result.hasWon;
            }
        }

        return { hasWon: hasWon, positions: positions };
    }

    private checkWinningToken(x: number, y: number, count: number): { hasWon: boolean, position: Phaser.Geom.Point, count: number } {
        let position = new Phaser.Geom.Point();
        if (this.tokens[x][y].player === this.players.getActivePlayer()) {
            position.x = x;
            position.y = y;
            count += 1;
        } else {
            count = 0;
        }

        return { hasWon: count == 4, position: position, count: count };
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