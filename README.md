# Single Screen Games

A selection of single screen games.

## Getting started

- Execute the following commands in **cmd** or **powershell**:

```powershell
git clone https://github.com/Mizar999/single-screen-games.git
cd .\single-screen-games\
npm install
npx concurrently npm:s-root npm:w-cfour
```

- See `./package.json` for additional **scripts**

## Avoid bleeding issues with tilesets

The following command will add a margin of 1px and a spacing of 2 px between the tiles:

```powershell
npx tile-extruder --tileWidth 64 --tileHeight 64 --input ./assets/hack_square_64x64.png --output ./assets/hack_square_64x64_extruded.png
```

## Links

- [Tile Extruder](https://github.com/sporadic-labs/tile-extruder)
- [Create a dialog modal plugin in Phaser 3](https://gamedevacademy.org/create-a-dialog-modal-plugin-in-phaser-3-part-1/)
- [A procedurally generated roguelike using Phaser](https://www.bytesizeadventures.com/procjam-2014-a-procedurally-generated-roguelike-using-phaser/)
- [JavaScript ECS](https://www.npmjs.com/package/js-ecs)
