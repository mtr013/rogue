// Конструктор игры
function Game() {
    this.width = 40;           // ширина карты в клетках
    this.height = 24;          // высота карты в клетках
    this.tileSize = 50;        // размер тайла в пикселях
    this.map = [];             // массив с состоянием клеток карты
    this.fieldDiv = null;      // div для отображения карты

    // Герой
    this.hero = { x: 0, y: 0, hp: 100, attack: 10 };

    this.swords = [];          // позиции мечей
    this.potions = [];         // позиции зелий
    this.enemies = [];         // позиции и здоровье врагов
}

// Инициализация игры
Game.prototype.init = function() {
    this.fieldDiv = document.getElementsByClassName('field')[0];

    this.generateMap();       // заполнение карты стенами
    this.generateRooms();     // создание комнат
    this.generateCorridors(); // создание проходов
    this.placeItems();        // размещение мечей и зельев
    this.placeHero();         // размещение героя
    this.placeEnemies();      // размещение врагов
    this.renderMap();         // отрисовка карты
    this.setupControls();     // управление героя
    var self = this;

    // движение врагов каждые 500 мс
    setInterval(function() {
        self.moveEnemies();
    }, 500);
};

// Генерация полной карты стенами
Game.prototype.generateMap = function() {
    for (var y = 0; y < this.height; y++) {
        this.map[y] = [];
        for (var x = 0; x < this.width; x++) {
            this.map[y][x] = 'W'; // стена
        }
    }
};

// Создание случайных комнат
Game.prototype.generateRooms = function() {
    var roomCount = 5 + Math.floor(Math.random() * 6); // 5-10 комнат
    for (var i = 0; i < roomCount; i++) {
        var roomWidth = 3 + Math.floor(Math.random() * 6);  // 3-8
        var roomHeight = 3 + Math.floor(Math.random() * 6); // 3-8
        var x0 = Math.floor(Math.random() * (this.width - roomWidth));
        var y0 = Math.floor(Math.random() * (this.height - roomHeight));

        // заполнение комнаты полом ('tile')
        for (var y = y0; y < y0 + roomHeight; y++)
            for (var x = x0; x < x0 + roomWidth; x++)
                this.map[y][x] = 'tile';
    }
};

// Создание проходов
Game.prototype.generateCorridors = function() {
    var count = 3 + Math.floor(Math.random() * 3); // 3-5 проходов
    for (var i = 0; i < count; i++) {
        var y = Math.floor(Math.random() * this.height);
        for (var x = 0; x < this.width; x++) this.map[y][x] = 'tile'; // горизонтальный
        var x = Math.floor(Math.random() * this.width);
        for (var y2 = 0; y2 < this.height; y2++) this.map[y2][x] = 'tile'; // вертикальный
    }
};

// Размещение предметов
Game.prototype.placeItems = function() {
    for (var i = 0; i < 2; i++) this.placeItem('SW'); // мечи
    for (var i = 0; i < 10; i++) this.placeItem('HP'); // зелья
};

// Размещение одного предмета
Game.prototype.placeItem = function(type) {
    var pos = this.randomEmpty();
    if (type === 'SW') this.swords.push(pos);
    else if (type === 'HP') this.potions.push(pos);
    this.map[pos.y][pos.x] = type;
};

// Размещение героя
Game.prototype.placeHero = function() {
    var pos = this.randomEmpty();
    this.hero.x = pos.x;
    this.hero.y = pos.y;
    this.map[pos.y][pos.x] = 'P';
};

// Размещение врагов
Game.prototype.placeEnemies = function() {
    for (var i = 0; i < 10; i++) {
        var pos = this.randomEmpty();
        var enemy = { x: pos.x, y: pos.y, hp: 50, attack: 5 };
        this.enemies.push(enemy);
        this.map[pos.y][pos.x] = 'E'; // враг
    }
};

// Поиск случайной пустой клетки
Game.prototype.randomEmpty = function() {
    var x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while (this.map[y][x] !== 'tile'); // только пол
    return { x: x, y: y };
};

// Отрисовка карты и объектов
Game.prototype.renderMap = function() {
    this.fieldDiv.innerHTML = '';
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var tile = document.createElement('div');
            tile.className = 'tile';
            var type = this.map[y][x];

            if (type === 'W') tile.className += ' tileW';
            else if (type === 'tile') tile.className += '';
            else if (type === 'P') tile.className += ' tileP';
            else if (type === 'HP') tile.className += ' tileHP';
            else if (type === 'SW') tile.className += ' tileSW';
            else if (type === 'E') tile.className += ' tileE';

            tile.style.left = (x * this.tileSize) + 'px';
            tile.style.top = (y * this.tileSize) + 'px';

            // полоска здоровья для героя
            if (type === 'P') {
                var healthDiv = document.createElement('div');
                healthDiv.className = 'health';
                healthDiv.style.width = this.hero.hp + '%';
                tile.appendChild(healthDiv);
            }

            // полоска здоровья для врага
            if (type === 'E') {
                for (var i = 0; i < this.enemies.length; i++) {
                    var e = this.enemies[i];
                    if (e.x === x && e.y === y) {
                        var healthDiv = document.createElement('div');
                        healthDiv.className = 'health';
                        healthDiv.style.width = e.hp + '%';
                        tile.appendChild(healthDiv);
                        break;
                    }
                }
            }

            this.fieldDiv.appendChild(tile);
        }
    }
};

// Управление героем
Game.prototype.setupControls = function() {
    var self = this;
    document.addEventListener('keydown', function(e) {
        var dx = 0, dy = 0;

        if (e.key === 'w') dy = -1;
        else if (e.key === 's') dy = 1;
        else if (e.key === 'a') dx = -1;
        else if (e.key === 'd') dx = 1;
        else if (e.key === ' ') {
            self.heroAttack(); // пробел = атака
            return;
        }

        var newX = self.hero.x + dx;
        var newY = self.hero.y + dy;

        if (self.inBounds(newX, newY) && self.map[newY][newX] !== 'W') {
            var tileType = self.map[newY][newX];
            if (tileType === 'HP') self.hero.hp = Math.min(100, self.hero.hp + 20);
            else if (tileType === 'SW') self.hero.attack += 10;

            self.map[self.hero.y][self.hero.x] = 'tile';
            self.hero.x = newX;
            self.hero.y = newY;
            self.map[newY][newX] = 'P';
            self.renderMap();
        }
    });
};

// Атака героя по соседним врагам
Game.prototype.heroAttack = function() {
    for (var i = 0; i < this.enemies.length; i++) {
        var e = this.enemies[i];
        if (Math.abs(e.x - this.hero.x) <= 1 && Math.abs(e.y - this.hero.y) <= 1) {
            e.hp -= this.hero.attack;
            if (e.hp <= 0) {
                this.map[e.y][e.x] = 'tile';
                this.enemies.splice(i, 1);
                i--;
            }
        }
    }
    this.renderMap();
};

// Движение врагов
Game.prototype.moveEnemies = function() {
    for (var i = 0; i < this.enemies.length; i++) {
        var e = this.enemies[i];
        var dx = Math.floor(Math.random() * 3) - 1;
        var dy = Math.floor(Math.random() * 3) - 1;
        var newX = e.x + dx;
        var newY = e.y + dy;

        if (this.inBounds(newX, newY) && this.map[newY][newX] === 'tile') {
            this.map[e.y][e.x] = 'tile';
            e.x = newX;
            e.y = newY;
            this.map[e.y][e.x] = 'E';
        }

        if (Math.abs(e.x - this.hero.x) <= 1 && Math.abs(e.y - this.hero.y) <= 1) {
            this.hero.hp -= e.attack;
        }

        if (this.hero.hp <= 0) {
            alert('Герой погиб! Игра окончена.');
        }
    }
    this.renderMap();
};

// Проверка границ карты
Game.prototype.inBounds = function(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
};
