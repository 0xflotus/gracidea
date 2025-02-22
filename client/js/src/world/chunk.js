//Imports
  import World from "./world.js"
  import u from "./../app/utils.js"
  import textures from "./../app/textures.js"
  import Element from "./element.js"

/**
 * World chunk.
 *
 * This class allows to split the world into smaller chunks for improved rendering.
 * Chunk are also divided internally into layers.
 */
  export default class Chunk extends Element {

    //Layers reference (contains {x, y, width, height, data} of each loaded layer)
      layers = new Map()

    //Constructor
      constructor({world, key}) {
        //Heritage
          super(...arguments)
        //References
          this.key = key
          this.world = world
        //Sprite creation
          this.sprite = new PIXI.Container()
          this.sprite.name = this.key
      }

    //Load a chunk layer
      async load({layer:{name:layer}, chunk:{x, y, width, height, data}}) {
        //Save layer data
          this.layers.set(layer, {x, y, width, height, data})
        //Update chunk origin and boundary
          this.origin = {x:Math.min(x, this.origin.x), y:Math.min(y, this.origin.y)}
          this.boundary = {x:Math.max(x, this.boundary.x), y:Math.max(y, this.boundary.y)}
        //Update world origin and boundary
          const {origin, boundary} = this.world
          u.sync({a:origin, b:{x:Math.min(this.origin.x, origin.x), y:Math.min(this.origin.y, origin.y)}})
          u.sync({a:boundary, b:{x:Math.max(this.boundary.x, boundary.x), y:Math.max(this.boundary.y, boundary.y)}})
      }

    //Render chunk
      async render({force, animated, fade}) {
        //Global flags
          const flags = {rendered:false}
        //Render layers
          for (let [layer, {x, y, width, height, data:tiles}] of this.layers.entries()) {
            //Skip if ignored layer
              if (World.layers.ignored.has(layer))
                continue
            //Retrieve chunk sprite
              const chunk = this.sprite.getChildByName(layer) ?? this.sprite.addChild(new PIXI.Container())
              chunk.name = layer
              chunk.position.set(u.to.coord.px(x), u.to.coord.px(y))
            //Skip rendering if already rendered
              if ((chunk.children.length)&&(!force)) {
                flags.rendered = true
                continue
              }
            //Animated chunk
              if (animated) {
                chunk.animated = chunk.animated ?? this.sprite.getChildByName(`${layer}_animated`) ?? this.sprite.addChild(new PIXI.Container())
                chunk.animated.name = `${layer}_animated`
                chunk.animated.position.set(u.to.coord.px(x), u.to.coord.px(y))
                chunk.animated.removeChildren()
              }
            //Render tiles
              flags.rendered = true
              chunk.cacheAsBitmap = false
              chunk.removeChildren()
              for (let [index, texture] of tiles.entries()) {
                //Check texture
                  let tile = null
                  if (--texture >= 0) {
                    //Animated texture
                      if (texture in textures.animated) {
                        tile = chunk.animated.addChild(new PIXI.AnimatedSprite(textures.animated[texture].frames.map(PIXI.Texture.from)))
                        tile.animationSpeed = textures.animated[texture].speed
                        if (animated)
                          animated.add(tile)
                      }
                    //Static texture
                      else
                        tile = chunk.addChild(new PIXI.Sprite.from(`${texture}`))
                    //Set position and size
                      tile.position.set(u.to.coord.px(index%width), u.to.coord.px(~~(index/width)))
                      tile.width = tile.height = World.Chunk.tile.size
                  }
                //Compute diff
                  if ((this.world.app.data.debug.diff)&&(this.world.diff)) {
                    const prev = (this.world.diff[layer]?.[this.key]?.data?.[index] ?? 0)-1
                    //New texture
                      if ((prev === -1)&&(texture >= 0))
                        tile.tint = 0x00FF00
                    //Deleted texture
                      else if ((texture === -1)&&(prev >= 0)) {
                        tile = chunk.addChild(new PIXI.Sprite.from(`${prev}`))
                        tile.position.set(u.to.coord.px(index%width), u.to.coord.px(~~(index/width)))
                        tile.width = tile.height = World.Chunk.tile.size
                        tile.tint = 0xFF0000
                      }
                    //Untouched texture
                      else if ((prev === texture)&&(texture >= 0))
                        tile.alpha = .15
                    //Edited texture
                      else if ((prev >= 0)&&(texture >= 0))
                        tile.tint = 0xFFFF00
                  }
              }
            //Cache
              chunk.cacheAsBitmap = true
          }
        //Additional processing if chunk has been rendered
          if (flags.rendered) {
            //Fade if needed
              if (fade)
                this.world.app.tween.fade({target:this.sprite, from:0, to:1, duration:16})
            //Add sprite
              this.world.layers.global.world.addChild(this.sprite)
            //Debug
              if (this.world.app.data.debug.chunks) {
                if (!this.graphics) {
                  this.graphics = this.sprite.addChild(new PIXI.Graphics())
                  this.graphics.lineStyle(1, 0x0000FF, .5).beginFill(0x0000FF, .25).drawRect(this.x*Chunk.tile.size, this.y*Chunk.tile.size, Chunk.tile.size*Chunk.tile.batch, Chunk.tile.size*Chunk.tile.batch).endFill()
                  this.graphics.addChild(new PIXI.Text(this.key, {fill:"#00F", stroke:"#FFF", strokeThickness:1, fontSize:12})).position.set(this.x*Chunk.tile.size, this.y*Chunk.tile.size)
                }
                else
                  this.sprite.addChild(this.sprite.removeChild(this.graphics))
              }
              else if (this.graphics) {
                this.sprite.removeChild(this.graphics).destroy(true)
                this.graphics = null
              }
          }
      }

    //Chunk key generator
      static key({x, y}) { return `${x};${y}` }

    //Tile general properties
      static tile = {size:16, batch:16}
  }