//Imports
  import NPC from "./npc.js"
  import u from "../../app/utils.js"

/**
 * Creatures.
 */
  export default class Creature extends NPC {

    //Constructor
      constructor({species, x, y, area, shiny}) {
        //Heritage
          super(...arguments)
        //Reference
          this.species = species
          this.area = area
        //Sprite creation
          this.shiny = shiny ?? (u.rand() > (1 - this.world.app.data.debug.shiny))
          this.sprite = new PIXI.AnimatedSprite(Creature.textures({endpoint:this.world.app.endpoints.maps, species, shiny:this.shiny}))
          this.world.layers.global.characters.addChild(this.sprite)
          this.sprite.animationSpeed = 0.125
          this.sprite.anchor.set(0.5, 1)
          this.sprite.play()
          this.x = x
          this.y = y
          this.world.app.tween.fade({target:this.sprite, from:0, to:1, duration:16})
        //Lifetime
          this.lifetime = u.rand({a:16, b:32, int:true})
        //Special processing
          if (Creature.species.flying.has(this.dex))
            this.in.air()
          if (this.area.water)
            this.in.water()
          if (this.area.tallgrass)
            this.in.tallgrass()
        //Interactions
          this.sprite.interactive = true
          this.sprite.buttonMode = true
          this.sprite.on("click", () => this.world.app.data.show.wiki.page = this.name)
          this.sprite.on("tap", () => this.world.app.data.show.wiki.page = this.name)
      }

    //Creature name (in correct lang)
      get name() { return this.world.app.data.lang.creatures[this.species][this.world.app.data.lang.id] }

    //Creature dex id
      get dex() { return this.world.app.data.lang.creatures[this.species].id }

    //Textures
      static textures({endpoint = "", species, defaults = "egg", shiny}) {
        return super.textures({endpoint:`${endpoint}/creatures`, key:`${shiny ? "shiny" : "regular"}/${species}`})
      }

    //Wander
      wander() {
        //Prepare movement
          const {x, y} = this
          const {dx, dy} = [{dx:0, dy:0}, {dx:-1, dy:0}, {dx:+1, dy:0}, {dx:0, dy:-1}, {dx:0, dy:+1}][Math.floor(u.rand()/0.25)]
        //Move if still inside forced area
          if ((dx || dy)&&(this.area.inside({x:x+dx, y:y+dy}))) {
            if (dx) {
              this.world.app.tween.property({target:this, change:"x", from:this.x, to:this.x+dx, duration:8})
              this.sprite.scale.x = -Math.sign(dx)
            }
            if (dy) {
              this.world.app.tween.property({target:this, change:"y", from:this.y, to:this.y+dy, duration:8})
            }
          }
      }

    //Update
      update() {
        //Update lifetime
          if (this.lifetime-- > 0) {
            //Wander
              this.wander()
          }
        //End of life
          else {
            this.area.creatures.delete(this)
            this.world.app.tween.fade({target:this.sprite, from:1, to:0, duration:32, callback:() => this.destroy()})
          }
      }

    //Special processing when inside
      in = {
        //When inside water
          water:() => {
            //Compute water coverage
              const uncovered = 1-this.offset.y-0.30
            //If completely over water, no need to add mask
              if (uncovered >= 1)
                return
            //Apply mask
              const mask = new PIXI.Graphics().beginFill(0x000000, 0.5).drawRect(-this.sprite.width/2, -this.sprite.height, this.sprite.width, this.sprite.height*uncovered).endFill()
              this.sprite.addChild(mask)
              this.sprite.mask = mask
          },
        //When in air
          air:() => {
            //Apply vertical offset
              this.offset.y = -.30
              if (this.area.water)
                this.offset.y *= 2
            //Shadow
              const mask = new PIXI.Graphics().beginFill(0x000000, 0.5).drawEllipse(0, -u.to.coord.px(this.offset.y), this.sprite.width/3, this.sprite.height/4).endFill()
              this.sprite.addChild(mask)
          },
        //When in tall grass
          tallgrass:() => {
            //Compute water coverage
              const uncovered = 1-this.offset.y-0.5
            //If completely over water, no need to add mask
              if (uncovered >= 1)
                return
            //Apply mask
              const mask = new PIXI.Graphics().beginFill(0x000000, 0.5).drawRect(-this.sprite.width/2, -this.sprite.height, this.sprite.width, this.sprite.height*uncovered).endFill()
              this.sprite.addChild(mask)
              this.sprite.mask = mask
          }
      }

    //Species data
      static species = {
        //Flying species
          flying:new Set([6, 41, 42, 83, 142, 144, 145, 146, 149, 166, 169, 176, 187, 188, 189, 193, 207, 249, 250, 278, 279, 284, 291, 333, 334, 373, 384, 414, 415, 416, 425, 426, 468, 469, 472, 479, 492, 527, 528, 561, 566, 567, 628, 642, 645, 666, 717, 774, 797])
      }
  }
