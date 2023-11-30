const settings = {
  map: {
    maxX: 20, 
    maxY: 12, 
    cellSize: 49, 
    minRooms: 5, 
    maxRooms: 10, 
    minRoomSize: 3, 
    maxRoomSize: 8, 
    minCorridors: 3,
    maxCorridors: 5, 
    corridorWidth: 1, 
  },

  gameElements: {
    HP: {
      quantity: 10, 
      effectValue: 30,
      type: 'HP',
    },
    swords: {
      quantity: 2,
      effectValue: 10, 
      actionTime: 3000,
      type: 'SW',
    }
  },

  enemies: {
    type: 'E', 
    damage: 10, 
    attackSpeed: 1000, 
    speed: 800, 
    quantity: 10, 

  },

  protagonist: {
    attackPower: 20, 
    type: 'P',
  }

}

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function createElements(quantity, create) {
    for (let i = 0; i < quantity; i++) {
      create(i);
    }
  }
  
  class Element {
    constructor([x, y]) {
      this.x = x;
      this.y = y;
    }
  
    setLocation([x, y]) {
      this.x = x;
      this.y = y;
    }
  }
  
  class Area extends Element {
    constructor(width, heihgt, coordinates = [0, 0]) {
      super(coordinates);
      this.width = width;
      this.heihgt = heihgt;
    }
  
    setRandomLocation(maxX, maxY) {
      this.setLocation([getRandomInt(0, maxX - this.width), getRandomInt(0, maxY - this.heihgt)]);
    }
  }
  
  class VerticalCorridor extends Area {
    constructor(widthCorridor, maxY, x = 0) {
      super(widthCorridor, maxY + 1, [x, 0]);
    }
  
    setRandomLocation(maxX) {
      this.setLocation([getRandomInt(0, maxX - this.width), 0]);
    }
  
  }
  
  class HorizontalCorridor extends Area {
    constructor(widthCorridor, maxX, y = 0) {
      super(maxX + 1, widthCorridor, [0, y]);
    }
  
    setRandomLocation(maxY) {
      this.setLocation([0, getRandomInt(0, maxY - this.heihgt)]);
    }
  }
  
  class Corridors extends Set {
    constructor(...params) {
      super(...params)
    }
  
    addToRandomLocation(corridor, maxCoordinate) {
      const controlSize = this.size + 1;
      while (this.size < controlSize) {
        corridor.setRandomLocation(maxCoordinate);
        this.add(corridor);
      }
    }
  }
  
  class Room extends Area {
    constructor(width, heihgt, coordinates = [0, 0]) {
      super(width, heihgt, coordinates);
    }
  
    _isPassable(corridors) {
      return [...corridors].reduce((result, corridor) => {
        const checkedData = corridor.width < corridor.heihgt ?
          { roomStart: this.x, roomEnd: this.x + this.width - 1, corridorStart: corridor.x, corridorEnd: corridor.x + corridor.width - 1 }
          : { roomStart: this.y, roomEnd: this.y + this.heihgt - 1, corridorStart: corridor.y, corridorEnd: corridor.y + corridor.heihgt - 1 }
        return result || (checkedData.roomStart <= checkedData.corridorEnd && checkedData.roomEnd >= checkedData.corridorStart)
      }, false)
    }
  
    setPassableLocation(corridors, maxX, maxY) {
      do {
        this.setRandomLocation(maxX, maxY)
      } while (!this._isPassable(corridors));
    }
  }
  
  class GameMap extends Array {
    constructor(settings) {
      super(settings.maxX);
      this.cellSize = settings.cellSize;
      this._maxX = settings.maxX;
      this._maxY = settings.maxY;
      this._settings = settings;
  
      for (let x = 0; x <= this._maxX; x++) {
        this[x] = new Array(this._maxY);
      }
    }
  
    _fillWithWall() {
      for (let x = 0; x <= this._maxX; x++) {
        for (let y = 0; y <= this._maxY; y++) {
          this[x][y] = 1;
        }
      }
    }
  
    _deleteArea(area) {
      for (let x = area.x; x < area.x + area.width; x++) {
        for (let y = area.y; y < area.y + area.heihgt; y++) {
          this[x][y] = 0;
        }
      }
    }
  
    _deleteWall(arrayOfAreas) {
      arrayOfAreas.forEach((area) => {
        this._deleteArea(area);
      })
    }
  
    generate() {
      const corridors = new Corridors();
      const rooms = new Array(this._settings.quantityOfRooms); 
  
      this._fillWithWall();
  
      createElements(this._settings.quantityOfVerticalCorridors, () => {
        corridors.addToRandomLocation(new VerticalCorridor(this._settings.corridorWidth, this._maxY), this._maxX);
      })
  
      createElements(this._settings.quantityOfHorizontalCorridors, () => {
        corridors.addToRandomLocation(new HorizontalCorridor(this._settings.corridorWidth, this._maxX), this._maxY);
      })
  
      createElements(this._settings.quantityOfRooms, (i) => {
        const roomWidth = getRandomInt(this._settings.minRoomSize, this._settings.maxRoomSize),
          roomHeight = getRandomInt(this._settings.minRoomSize, this._settings.maxRoomSize);
        rooms[i] = new Room(roomWidth, roomHeight);
        rooms[i].setPassableLocation(corridors, this._maxX, this._maxY);
      })

      this._deleteWall([...corridors, ...rooms]);
    }
  
    isWall([x, y]) {
      if (x < 0 || y < 0 || x > this._maxX || y > this._maxY) return 1;
      else return this[x][y]
    }
  
    getRandomCoordinates() {
      let x, y;
      do {
        x = getRandomInt(0, this._maxX);
        y = getRandomInt(0, this._maxY);
      } while (this.isWall([x, y]));
      return [x, y]
    }
  }
  
  class ItemCollection extends Array {
    constructor(...params) {
      super(...params);
    }
  
    getElementsAround([x, y]) {
      return this.filter((element) => {
        return ((element.x === x + 1 || element.x === x - 1) && (element.y === y || element.y === y + 1 || element.y === y - 1) || (element.x === x && (element.y === y + 1 || element.y === y - 1)))
      })
    }
  
    getElement([x, y]) {
      return this.find((element) => {
        return element.x === x && element.y === y
      })
    }
  
    getRandomFreeCoordinates(getRandomNoWall, collections) {
      let x, y;
      do {
        [x, y] = getRandomNoWall();
      } while (collections ?
          (this.getElement([x, y]) || collections.reduce((result, collection) => {
            return result || collection.getElement([x, y])
          }, undefined))
          : this.getElement([x, y]));
      return [x, y]
    }
  
    add(element) {
      this[this.length] = element;
    }
  }
  
  class GameElement extends Element {
    constructor(settings, index, [x, y]) {
      super([x, y]);
      this.type = settings.type;
      this.id = settings.type + index;
      this.effectValue = settings.effectValue;
      this.actionTime = settings.actionTime;
    }
  
    remove() {
      $(`#x${this.x}y${this.y}`).removeClass(`tile${this.type}`);
      this.setLocation([-1, -1]);
    }
  }
  
  class Personage extends GameElement {
    constructor(settings, index, [x, y]) {
      super(settings, index, [x, y]);
      this.HP = 100;
    }
  
    _isUnavailable([x, y], map, elements) {
      return map.isWall([x, y]) || elements.getElement([x, y])
    }
  
    _changeHP(attackPower) {
      this.HP = (this.HP - attackPower >= 100) ? 100 : this.HP - attackPower;
      $(`#${this.id} .health`).css({ width: `${this.HP}%` });
    }
  
    move([x, y], map, elements) {
      if (!this._isUnavailable([x, y], map, elements)) {
        this.setLocation([x, y])
        $(`#${this.id}`).css({ top: `${this.y * map.cellSize}px`, left: `${this.x * map.cellSize}px` });
        return true;
      } else return false;
    }
  
    attack(target) {
      target.takeHit(this.effectValue);
      $(`#${this.id}`).addClass('attack');
      setTimeout(() => { $(`#${this.id}`).removeClass('attack'); }, 300);
    }
  
    takeHit(damage) {
      this._changeHP(damage);
      $(`#${this.id}`).addClass('damage');
      setTimeout(() => { $(`#${this.id}`).removeClass('damage'); }, 300);
    }
  
  }
  
  class Enemy extends Personage {
    constructor(settings, index, [x, y]) {
      super({ type: settings.type, effectValue: settings.damage }, index, [x, y]);
      this._attackSpeed = settings.attackSpeed;
      this._speed = settings.speed;
      this.isAttack = false;
      this._isFollow = false;
    }
  
    stop() {
      this._stopFollow();
      this._stopRandomMove();
      clearInterval(this._attackTimer);
      this.isAttack = false;
    }
  
    _stopFollow() {
      clearInterval(this._followTimer);
      this._isFollow = false;
      $(`#${this.id}`).removeClass('follow');
    }
  
    _stopRandomMove() {
      clearInterval(this._randomMoveTimer);
    }
  
    stopAttack(protagonist, map) {
      this.isAttack = false;
      clearInterval(this._attackTimer);
      $(`#${this.id}`).removeClass('attack');
      if (!this._isfollow) this._follow(protagonist, map, this._obstacles);
    }
  
    _follow(protagonist, map) {
      if (!this._isFollow) {
        this._isFollow = true;
        $(`#${this.id}`).addClass('follow');
        this._followTimer = setInterval(() => {
          const differenceX = protagonist.x - this.x;
          const differenceY = protagonist.y - this.y;
          if (Math.abs(differenceX) > 1 || Math.abs(differenceY) > 1) {
            const stepX = differenceX ? differenceX / Math.abs(differenceX) : 0;
            const stepY = differenceY ? differenceY / Math.abs(differenceY) : 0;
            const moveStatusX = this.move([this.x + stepX, this.y], map, this._obstacles, protagonist);
            setTimeout(() => {
              const moveStatusY = this.move([this.x, this.y + stepY], map, this._obstacles, protagonist);
              if (!moveStatusX && !moveStatusY) {
                this._stopFollow();
                this.randomMove(map, this._obstacles, protagonist);
              }
            }, this._speed / 4);
          }
        }, this._speed / 2);
      }
    }
  
    randomMove(map, elements, protagonist) {
      this._obstacles = elements;
      const mode = getRandomInt(1, 3);
      let stepX = 1;
      let stepY = -1;
      this._randomMoveTimer = setInterval(() => {
        switch (mode) {
          case 1: {
            stepX = 0;
          } break;
          case 2: {
            stepY = 0;
          } break;
          case 3: {
            stepX = getRandomInt(-1, 1);
            stepY = stepX ? 0 : getRandomInt(-1, 1);
          } break;
        }
        const moveStatus = this.move([this.x + stepX, this.y + stepY], map, elements, protagonist);
        if (!moveStatus) {
          stepX = stepX * -1;
          stepY = stepY * -1
        }
      }, this._speed);
    }
  
    move([x, y], map, elements, protagonist) {
      const result = super.move([x, y], map, elements);
      if (elements.getElementsAround([this.x, this.y]).includes(protagonist)) {
        if (!this.isAttack) this.attack(protagonist, map, elements);
      } else {
        if (this.isAttack) this.stopAttack();
      }
      return result;
    }
  
    remove() {
      $(`#${this.id}`).remove();
      this.setLocation([-10, -10]);
      this.stop();
    }
  
    takeHit(attackPower) {
      super.takeHit(attackPower);
      if (this.HP <= 0) {
        this.stop();
        this.remove();
      }
    }
  
    attack(protagonist) {
      this._stopRandomMove();
      this._stopFollow();
      this.isAttack = true;
      super.attack(protagonist);
      this._attackTimer = setInterval(() => {
        if (protagonist.HP > 0)
          super.attack(protagonist);
        else this.stop();
      }, this._attackSpeed);
    }
  }
  
  class Protagonist extends Personage {
    constructor(game, settings, index = 0, [x, y] = [0, 0]) {
      super({ type: settings.type, effectValue: settings.attackPower }, index, [x, y]);
      this.swordType = settings.swordType;
      this.HPType = settings.HPType;
      this.game = game;
    }
  
    move([x, y], enemies, gameElements) {
      if (super.move([x, y], this.game.gameMap, enemies)) {
        const aroundEnemies = enemies.getElementsAround([x, y]);
        enemies.forEach((enemy) => {
          if (!aroundEnemies.includes(enemy) && enemy.isAttack) enemy.stopAttack(this, this.game.gameMap);
        })
        aroundEnemies.forEach((enemy) => {
          if (!enemy.isAttack) enemy.attack(this, this.game.gameMap, enemies);
        })
        const gameElement = gameElements.getElement([this.x, this.y]);
        if (gameElement) {
          switch (gameElement.type) {
            case this.HPType: {
              $(`#${this.id}`).addClass('heal');
              setTimeout(() => { $(`#${this.id}`).removeClass('heal'); }, 100);
              this._changeHP(-gameElement.effectValue);
              gameElement.remove();
            } break;
            case this.swordType: {
              this.effectValue = this.effectValue + gameElement.effectValue;
              $(`#${this.id}`).addClass('boost');
              gameElement.remove();
              setTimeout(() => {
                $(`#${this.id}`).removeClass('boost');
                this.effectValue = this.effectValue - gameElement.effectValue;
              }, gameElement.actionTime);
            } break;
          }
        }
      }
    }
  
    attack(enemies) {
      enemies.getElementsAround([this.x, this.y]).forEach((enemy) => {
        super.attack(enemy);
        if (!$(`.tile${enemies[0].type}`)[0]) this.game.gameOver(false);
      })
    }
  
    takeHit(damage) {
      super.takeHit(damage);
      if (this.HP <= 0) {
        this.game.gameOver(true);
      }
    }
  }
  
  class Game {
    constructor(settings) {
      this._mapSettings = settings.map;
      this._mapSettings.quantityOfVerticalCorridors = getRandomInt(settings.map.minCorridors, settings.map.maxCorridors); 
      this._mapSettings.quantityOfHorizontalCorridors = getRandomInt(settings.map.minCorridors, settings.map.maxCorridors);
      this._mapSettings.quantityOfRooms = getRandomInt(settings.map.minRooms, settings.map.maxRooms); 
      this._gameElementsSettings = settings.gameElements;
      this._enemiesSettings = settings.enemies;
      this._protagonistSettings = settings.protagonist;
      this._protagonistSettings.swordType = settings.gameElements.swords.type;
      this._protagonistSettings.HPType = settings.gameElements.HP.type;
      this.isOver = true;
    }
  
    _generateGameElements() {
      createElements(this._gameElementsSettings.swords.quantity, (index) => {
        this._gameElements.add(new GameElement(this._gameElementsSettings.swords, index, this._gameElements.getRandomFreeCoordinates(this.gameMap.getRandomCoordinates.bind(this.gameMap))));
      })
  
      createElements(this._gameElementsSettings.HP.quantity, (index) => {
        this._gameElements.add(new GameElement(this._gameElementsSettings.HP, index, this._gameElements.getRandomFreeCoordinates(this.gameMap.getRandomCoordinates.bind(this.gameMap))));
      })
    }
  
    _generatePersonages() {
      createElements(this._enemiesSettings.quantity + 1, (index) => {
        const coordinates = this._enemies.getRandomFreeCoordinates(this.gameMap.getRandomCoordinates.bind(this.gameMap), [this._gameElements])
        if (index < this._enemiesSettings.quantity) {
          this._enemies.add(new Enemy(this._enemiesSettings, index, coordinates));
        } else {
          this._protagonist.setLocation(coordinates);
        }
      })
    }
  
    _showAll() {
      this.gameMap.forEach((vertical, x) => {
        vertical.forEach((cell, y) => {
          $('.field').append(`<div id="x${x}y${y}" class="tile ${cell ? 'tileW' : ''}" style="left:${x * this._mapSettings.cellSize}px; top:${y * this._mapSettings.cellSize}px"></div>`);
        })
      })
  
      this._gameElements.forEach((element) => {
        $(`#x${element.x}y${element.y}`).addClass(`tile${element.type}`);
      })
  
      this._enemies.forEach((element) => {
        $('.field').append(`<div id="${element.id}" class="tile tile${element.type}" style="left:${element.x * this._mapSettings.cellSize}px; top:${element.y * this._mapSettings.cellSize}px"><div class="health" style="width: ${element.HP}%;"></div></div>`);
      })
  
      $('.field').append(`<div id=${this._protagonist.id} class="tile tile${this._protagonist.type}" style="left:${this._protagonist.x * this._mapSettings.cellSize}px; top:${this._protagonist.y * this._mapSettings.cellSize}px"><div class="health" style="width: ${this._protagonist.HP}%;"></div></div>`);
    }
  
    _keydownHandler(e) {
      switch (e.code) {
        case 'KeyW': this._protagonist.move([this._protagonist.x, this._protagonist.y - 1], this._enemies, this._gameElements); break;
        case 'KeyA': this._protagonist.move([this._protagonist.x - 1, this._protagonist.y], this._enemies, this._gameElements); break;
        case 'KeyS': this._protagonist.move([this._protagonist.x, this._protagonist.y + 1], this._enemies, this._gameElements); break;
        case 'KeyD': this._protagonist.move([this._protagonist.x + 1, this._protagonist.y], this._enemies, this._gameElements); break;
      }
    }
  
    _keyupHandler(e) {
      switch (e.code) {
        case 'Space': this._protagonist.attack(this._enemies); break;
      }
    }
  
    _addKeyboardControls() {
      document.onkeydown = this._keydownHandler.bind(this);
      document.onkeyup = this._keyupHandler.bind(this);
    }
  
    _removeKeyboardControls() {
      document.onkeydown = null;
      document.onkeyup = null;
    }
  
    _addStartHandler() {
      document.addEventListener('keydown', this._startGame.bind(this), { once: true });
    }
  
    _startGame() {
      if (this.isOver) {
        this.isOver = false;
        $('#hover').remove();
        this._showAll();
        this._enemies.forEach((enemy) => {
          enemy.randomMove(this.gameMap, new ItemCollection(...this._enemies, ...this._gameElements, this._protagonist), this._protagonist)
        })
        this._addKeyboardControls();
      }
    }
  
    gameOver(isLoss) {
      if (!this.isOver) {
        this.isOver = true;
        this._enemies.forEach((enemy) => {
          enemy.stop();
        })
        this._removeKeyboardControls();
        $('.field').empty();
        this.init(isLoss ? 'Поражение' : 'Вы победили');
      }
    }
  
    init(message = '') {
      $('.field').append(`<div id="hover" class="field__hover"><b>${message}<b><br/><br/>Новая игра</div></div>`);
      this.gameMap = new GameMap(this._mapSettings);
      this._protagonist = new Protagonist(this, this._protagonistSettings);
      this._enemies = new ItemCollection(); 
      this._gameElements = new ItemCollection(); 
      this.gameMap.generate()
      this._generateGameElements();
      this._generatePersonages();
      setTimeout(() => {
        this._addStartHandler();
      }, 500);
    }
  }