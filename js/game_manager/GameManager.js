class GameManager {
  constructor(scene, mapData) {
    this.scene = scene;
    this.mapData = mapData;

    this.spawners = {};
    this.coffees = {};
    this.monsters = {};
    this.players = {};
    this.playerLocations = [];
    this.coffeeLocations = {};
    this.monsterLocations = {};
  }
  setup() {
    this.parseMapData();
    this.setupEventListener();
    this.setupSpawners();
    this.spawnPlayer();
  }

  parseMapData() {
    this.mapData.forEach((layer) => {
      
      if (layer.name === 'player_locations') {
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x, obj.y]);
        });
      } else if (layer.name === 'coffee_locations') {
        layer.objects.forEach((obj) => {
          if (this.coffeeLocations[obj.properties.spawner]) {
            this.coffeeLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
            this.coffeeLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
          
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach((obj) => {
          if (this.monsterLocations[obj.properties.spawner]) {
            this.monsterLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
            this.monsterLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      }
    });
    // console.log(this.playerLocations);
    // console.log(this.coffeeLocations);
    // console.log(this.monsterLocations);

  }

  setupEventListener() {
    this.scene.events.on('pickUpCoffee', (coffeeId, playerId) => {
      // update spawner
      if (this.coffees[coffeeId]) {
        // short hand for setting bitcoin variable from coffees[coffeeId].bitcoin this is probably a bad idea.. just trying to learn javascript and see if this works.
        const { bitcoin } = this.coffees[coffeeId];

        // updating player balance
        this.players[playerId].updateBitcoin(bitcoin);
        this.scene.events.emit('updateBalance', this.players[playerId].bitcoin);

        // remove coffee
        this.spawners[this.coffees[coffeeId].spawnerId].removeObject(coffeeId);
        this.scene.events.emit('coffeeRemoved', coffeeId);
      }

    });
    this.scene.events.on('monsterAtttacked', (monsterId, playerId) => {
      // update spawner
      // console.log('debug: '+ Object.keys(this.players[playerId]));
      // console.log('playerid: '+playerId);
      if (this.monsters[monsterId]) {
        const { bitcoin, attack } = this.monsters[monsterId];
        this.monsters[monsterId].loseHealth(2*Mode[DIFFICULTY]);
        // console.log('health' + this.monsters[monsterId].health);
        // check health remove monster if dead
        
        if (this.monsters[monsterId].health <= 0) {

          this.players[playerId].updateBitcoin(bitcoin);
          this.scene.events.emit('updateBalance', this.players[playerId].bitcoin);
          // console.log('health2' + this.monsters[monsterId].health);
          this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
          this.scene.events.emit('monsterRemoved', monsterId);
          // give player some more health if they kill a monster
          this.players[playerId].updateHealth(-10);
          this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);
        } else {
          this.players[playerId].updateHealth(attack);
          //update player health
          this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);
          //update monster health
          this.scene.events.emit('updateMonsterHealth', monsterId, this.monsters[monsterId].health);

          // respawn player if he be ded 
          if (this.players[playerId].health <= 0) {
            // update balance to take a 50% penalty
            // 10 represents the "radix" i believe this should be 10 for base 10 numbering
            let reduceAmount = parseInt(-this.players[playerId].bitcoin/2);
            // console.log(reduceAmount);
            this.players[playerId].updateBitcoin(reduceAmount);
            this.scene.events.emit('updateBalance', this.players[playerId].bitcoin);
            //respawn
            this.players[playerId].respawn();
            this.scene.events.emit('respawnPlayer', this.players[playerId]);
          }
        }
      }

    });
  }
  setupSpawners() {
    const config = {
      spawnInterval: 3000,
      limit: 3,
      spawnerType: '',
      id: ''
    };
    let spawner;


    Object.keys(this.coffeeLocations).forEach((key) => {
      config.id = `coffee-${key}`;
      config.spawnerType = SpawnerType.CHEST;
      spawner = new Spawner(
        config,
        this.coffeeLocations[key],
        this.addCoffee.bind(this),
        this.deleteCoffee.bind(this)
      );
      this.spawners[spawner.id] = spawner;
    });


    Object.keys(this.monsterLocations).forEach((key) => {
      config.id = `monster-${key}`;
      config.spawnerType = SpawnerType.MONSTER;

      spawner = new Spawner(
        config,
        this.monsterLocations[key],
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this)
      );
      this.spawners[spawner.id] = spawner;
    });
  }

  spawnPlayer() {
    const player = new PlayerModel(this.playerLocations);
    this.players[player.id] = player;
    this.scene.events.emit('spawnPlayer', player);
  }
  addCoffee(coffeeId, coffee) {
    this.coffees[coffeeId] = coffee;
    this.scene.events.emit('coffeeSpawned', coffee);
  }
  deleteCoffee(coffeeId) {
    delete this.coffees[coffeeId];
  }
  addMonster(monsterId, monster) {
    this.monsters[monsterId] = monster;
    this.scene.events.emit('monsterSpawned', monster);
  }
  deleteMonster(monsterId) {
    delete this.monsters[monsterId];
  }
  moveMonsters() {
    this.scene.events.emit('monsterMovement', this.monsters);
  }
}

