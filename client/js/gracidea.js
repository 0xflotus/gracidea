function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}(async function(){var d,e,f,g,a=Math.ceil,b=Math.max,c=Math.min;const h={animated:{2374:{frames:[2374,2375,2376,2377,2378,2379,2380,2381].map(a=>`${a}`),speed:.075}}};PIXI.settings.SCALE_MODE=PIXI.SCALE_MODES.NEAREST,PIXI.settings.MIPMAP_TEXTURES=PIXI.MIPMAP_MODES.OFF;const i=new URLSearchParams(window.location.search),j={basename({path:a,extension:b}){return a.substring(1+a.lastIndexOf("/")).replace(/(\..+?)$/,b?"$1":"")},mget({map:a,key:b,create:c}){return!a.has(b)&&a.set(b,c(b)),a.get(b)},rc(a){return a*l.Chunk.tile.size},dist(c,a){return Math.sqrt((a.x-c.x)**2+(a.y-c.y)**2)}};class k{constructor({world:a}){_defineProperty(this,"ready",new Promise(()=>null)),_defineProperty(this,"data",{user:{position:{x:0,y:0}},maps:[],show:{map:!1},lang:{},ready:!1}),_defineProperty(this,"methods",{camera:({x:a,y:b,offset:c})=>this.world.camera({x:a,y:b,offset:c}),update:()=>this.data.user.position={x:~~(this.view.center.x/l.Chunk.tile.size),y:~~(this.view.center.y/l.Chunk.tile.size)},render:()=>this.world.render(),redirect:a=>window.location.replace(a)}),_defineProperty(this,"renderer",new PIXI.Application({width:document.body.clientWidth,height:document.body.clientHeight,transparent:!0,resizeTo:window,antialias:!0})),_defineProperty(this,"viewport",new Viewport.Viewport({screenWidth:window.innerWidth,screenHeight:window.innerHeight,interaction:this.renderer.renderer.plugins.interaction})),_defineProperty(this,"controller",new Vue({el:"#app",data:this.data,methods:this.methods,mounted:()=>document.querySelector("#app .view").appendChild(this.renderer.view)})),_defineProperty(this,"view",this.renderer.stage.addChild(this.viewport)),_defineProperty(this,"tween",{quadInOut:a=>a*a,fade:({target:a,change:b,from:d,to:e,duration:f})=>{let g=0,h=a.cacheAsBitmap;a.cacheAsBitmap=!1;const i=j=>{1<=(g+=j)/f?(a[b]=e,a.cacheAsBitmap=h,this.renderer.ticker.remove(i)):a[b]=c(e,d+(e-d)*this.tween.quadInOut(g/f))};this.renderer.ticker.add(i)}}),this.world=new l({app:this,name:a}),this.view.on("moved",()=>this.methods.update()),this.view.on("moved-end",()=>this.methods.render()),this.view.on("zoomed-end",()=>this.methods.render()),this.view.drag().pinch().wheel().decelerate().clamp({direction:"all"}).clampZoom({minScale:.5,maxScale:1}),this.view.scale.set(1),this.ready=new Promise(async a=>{await this.world.load.world(),k.loader.renderer.load(async()=>{await this.world.load.sea(),await this.world.render({delay:0}),this.methods.camera(i.has("x")&&i.has("y")?{x:+i.get("x")||0,y:+i.get("y")||0,offset:{x:0,y:0}}:{x:329,y:-924}),this.methods.update(),this.data.ready=!0,this.data.lang=(await axios.get(`/lang/${i.get("lang")||"en"}.json`)).data,a()})})}}_defineProperty(k,"loader",{renderer:PIXI.Loader.shared});class l{constructor({app:a,name:b}){_defineProperty(this,"origin",{x:1/0,y:1/0}),_defineProperty(this,"boundary",{x:-Infinity,y:-Infinity}),_defineProperty(this,"chunks",new Map),_defineProperty(this,"load",{world:async()=>{var a=Math.abs;const{layers:b,tilesets:c}=(await axios.get(`/maps/${this.name}/map.json`)).data;for(let a of c)k.loader.renderer.add(`/maps/${this.name}/${j.basename({path:a.source,extension:!1})}.textures.json`);for(let a of b)for(let b of a.chunks)await j.mget({map:this.chunks,key:l.Chunk.key(b),create:a=>new l.Chunk({world:this,key:a})}).load({layer:a,chunk:b});this.app.viewport.left=this.origin.x*l.Chunk.tile.size,this.app.viewport.top=this.origin.y*l.Chunk.tile.size,this.app.viewport.worldWidth=a(this.boundary.x-this.origin.x)*l.Chunk.tile.size,this.app.viewport.worldHeight=a(this.boundary.y-this.origin.y)*l.Chunk.tile.size,this.sprite.position.set(-this.origin.x*l.Chunk.tile.size,-this.origin.y*l.Chunk.tile.size),this.app.data.maps=(await axios.get(`/maps/${this.name}/locations.json`)).data},sea:async()=>{this.sea=new l.Sea({world:this}),this.sprite.addChildAt(this.sea.sprite,0)}}),this.name=b,this.sprite=new PIXI.Container,this.sprite.name=this.name,this.app=a,this.app.viewport.addChild(this.sprite)}async render({center:c=this.app.data.user.position,delay:d=100,radius:e="auto",offset:f=this.origin,force:g=!1}={}){clearTimeout(this._render),this._render=setTimeout(async()=>{"auto"===e&&(e=a(1.5*b(this.app.renderer.view.height/l.Chunk.tile.size,this.app.renderer.view.width/l.Chunk.tile.size))),f&&(c={x:c.x+f.x,y:c.y+f.y});const d=new Set,h=[];for(let a of this.chunks.values())h.push(a.render({center:c,radius:e,force:g,animated:d}));await Promise.all(h),d.forEach(a=>(a.play(),a.parent.cacheAsBitmap=!1)),i.set("x",this.app.data.user.position.x),i.set("y",this.app.data.user.position.y),window.history.pushState("","",`/?${i.toString()}`)},d),this.sea.refresh(this.app.data.user.position)}camera({x:a,y:b,offset:c=this.origin}){this.app.viewport.moveCenter({x:(a-c.x)*l.Chunk.tile.size,y:(b-c.y)*l.Chunk.tile.size}),this.app.methods.update(),this.render()}}_defineProperty(l,"layers",{ignored:new Set(["00-boundaries"])}),l.Chunk=(e=d=class{constructor({world:a,key:b}){_defineProperty(this,"layers",new Map),this.key=b,this.world=a,this.sprite=new PIXI.Container,this.sprite.name=this.key,this.world.sprite.addChild(this.sprite)}async load({layer:{name:a},chunk:{x:d,y:e,width:f,height:g,data:h}}){this.layers.set(a,{x:d,y:e,width:f,height:g,data:h});const{origin:i,boundary:j}=this.world;i.x=c(d,i.x),i.y=c(e,i.y),j.x=b(d,j.x),j.y=b(e,j.y)}async render({center:a,radius:b,force:c,animated:d,cache:e}){for(let[f,{x:g,y:i,width:k,height:m,data:n}]of this.layers.entries()){if(l.layers.ignored.has(f))continue;const m=this.sprite.getChildByName(f)||this.sprite.addChild(new PIXI.Container);if(m.name=f,m.position.set(j.rc(g),j.rc(i)),j.dist(a,{x:g,y:i})>b){m.removeChildren();continue}if(m.children.length&&!c)continue;const o={};m.cacheAsBitmap=!1,m.alpha=0,m.removeChildren();for(let[a,b]of n.entries()){let c=null;b--,b in h.animated?(c=m.addChild(new PIXI.AnimatedSprite(h.animated[b].frames.map(PIXI.Texture.from))),c.animationSpeed=h.animated[b].speed,d&&(d.add(c),o.animated=!0)):c=m.addChild(new PIXI.Sprite.from(`${b}`)),c.position.set(j.rc(a%k),j.rc(~~(a/k))),c.width=c.height=l.Chunk.tile.size}e&&(m.cacheAsBitmap=!0),o.animated||(m.cacheAsBitmap=!0),this.world.app.tween.fade({target:m,change:"alpha",from:0,to:1,duration:15})}}static key({x:a,y:b}){return`${a};${b}`}},_defineProperty(d,"tile",{size:16}),e),l.Sea=(g=f=class{constructor({world:a}){this.world=a,this.sprite=new PIXI.Sprite,this.render({delay:0})}async render({delay:b=250}={}){clearTimeout(this._render),this._render=setTimeout(async()=>{this.sprite.removeChildren(),this.sprite.anchor.set(.5);const b=a(this.world.app.renderer.view.width/l.Chunk.tile.size),c=a(this.world.app.renderer.view.height/l.Chunk.tile.size),d=h.animated[`${l.Sea.texture}`];for(let a=-b;a<=b;a++)for(let b=-c;b<=c;b++){const c=this.sprite.addChild(new PIXI.AnimatedSprite(d.frames.map(PIXI.Texture.from)));c.animationSpeed=d.speed,c.position.set(a*l.Chunk.tile.size,b*l.Chunk.tile.size),c.width=c.height=l.Chunk.tile.size,c.play()}},b)}refresh({x:a,y:b}){const{origin:c}=this.world;this.sprite.alpha=0,this.sprite.position.set((c.x+a)*l.Chunk.tile.size,(c.y+b)*l.Chunk.tile.size),this.world.app.tween.fade({target:this.sprite,change:"alpha",from:0,to:1,duration:15})}},_defineProperty(f,"texture",2374),g);const m=new k({world:"overworld"});await m.ready})();