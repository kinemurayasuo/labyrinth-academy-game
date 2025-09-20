const game = {
    day: 1,
    phase: 'day',
    location: 'classroom',

    player: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        int: 10,
        charm: 10,
        str: 10,
        exp: 0,
        level: 1,
        inventory: []
    },

    heroines: {
        heroineA: {
            name: '세라 (검술 천재)',
            affection: 0,
            maxAffection: 100,
            description: '쿨하고 실력 지상주의자. 강한 상대를 찾고 있다.',
            dialogues: [
                "...너도 탐사자인가?",
                "실력으로 증명해봐.",
                "나쁘지 않네... 조금은.",
                "너와 함께라면... 아니, 아무것도 아니야.",
                "강해지고 싶어? 내가 가르쳐줄게."
            ],
            events: [],
            gifts: ['검술 교본', '훈련용 검', '전투 기록'],
            skills: {
                name: '검기 폭발',
                description: '강력한 물리 공격',
                damage: 30
            }
        },
        heroineB: {
            name: '루나 (마법 영재)',
            affection: 0,
            maxAffection: 100,
            description: '밝고 사교적. 명문 마법 가문 출신.',
            dialogues: [
                "안녕! 새로운 친구구나!",
                "마법은 정말 아름다워, 그렇지 않니?",
                "가문의 기대가... 때로는 버거워.",
                "너와 있으면 편안해져.",
                "우리... 계속 친구일 수 있을까?"
            ],
            events: [],
            gifts: ['마법서', '마나 크리스탈', '희귀한 꽃'],
            skills: {
                name: '원소 폭풍',
                description: '강력한 마법 공격',
                damage: 25,
                mpCost: 10
            }
        },
        heroineC: {
            name: '미스티 (신비한 사서)',
            affection: 0,
            maxAffection: 100,
            description: '말이 없고 책을 좋아한다. 미궁의 비밀을 알고 있는 듯하다.',
            dialogues: [
                "...책을 읽고 있었어.",
                "미궁의 진실... 알고 싶어?",
                "고대의 기록에는... 흥미로운 것들이 많아.",
                "너는... 특별해.",
                "운명의 실이... 우리를 연결하고 있어."
            ],
            events: [],
            gifts: ['고대 문서', '희귀한 책', '신비한 펜던트'],
            skills: {
                name: '지식의 축복',
                description: '모든 스탯 일시 증가',
                buff: true
            }
        }
    },

    labyrinth: {
        floor: 1,
        currentRoom: null,
        map: [],
        enemies: [
            { name: '슬라임', hp: 30, maxHp: 30, attack: 5, exp: 10, drop: '슬라임 조각' },
            { name: '고블린', hp: 50, maxHp: 50, attack: 8, exp: 20, drop: '고블린의 칼날' },
            { name: '늑대', hp: 70, maxHp: 70, attack: 12, exp: 30, drop: '늑대 가죽' },
            { name: '오크', hp: 100, maxHp: 100, attack: 15, exp: 50, drop: '오크의 도끼' },
            { name: '마법사', hp: 80, maxHp: 80, attack: 20, exp: 70, drop: '마법의 지팡이' }
        ],
        currentEnemy: null,
        roomTypes: ['battle', 'treasure', 'event', 'empty', 'trap'],

        generateMap() {
            this.map = [];
            const roomCount = Math.floor(Math.random() * 6) + 10;

            for (let i = 0; i < roomCount; i++) {
                const roomType = this.roomTypes[Math.floor(Math.random() * this.roomTypes.length)];
                this.map.push({
                    id: i,
                    type: roomType,
                    visited: false,
                    connections: []
                });
            }

            for (let i = 0; i < roomCount - 1; i++) {
                this.map[i].connections.push(i + 1);
                if (i > 0) {
                    this.map[i].connections.push(i - 1);
                }
            }

            this.currentRoom = 0;
            this.map[0].visited = true;
        },

        enterRoom(roomId) {
            const room = this.map[roomId];
            room.visited = true;
            this.currentRoom = roomId;

            let description = '';

            switch(room.type) {
                case 'battle':
                    this.currentEnemy = {...this.enemies[Math.floor(Math.random() * this.enemies.length)]};
                    description = `${this.currentEnemy.name}이(가) 나타났다!`;
                    this.showBattle();
                    break;
                case 'treasure':
                    const item = this.getRandomItem();
                    game.player.inventory.push(item);
                    description = `보물 상자를 발견했다! ${item}을(를) 획득했다.`;
                    game.updateInventory();
                    break;
                case 'event':
                    description = this.getRandomEvent();
                    break;
                case 'trap':
                    const damage = Math.floor(Math.random() * 20) + 10;
                    game.player.hp -= damage;
                    description = `함정에 걸렸다! ${damage}의 데미지를 입었다.`;
                    game.updatePlayerStats();
                    break;
                case 'empty':
                    description = '텅 빈 방이다. 잠시 쉬어갈 수 있을 것 같다.';
                    game.player.hp = Math.min(game.player.hp + 10, game.player.maxHp);
                    game.updatePlayerStats();
                    break;
            }

            document.getElementById('roomDescription').innerHTML = `<p>${description}</p>`;
            return description;
        },

        showBattle() {
            document.getElementById('battleArea').classList.remove('hidden');
            document.getElementById('explorationArea').style.display = 'none';

            document.getElementById('enemyName').textContent = this.currentEnemy.name;
            document.getElementById('enemyHpText').textContent = `HP: ${this.currentEnemy.hp}/${this.currentEnemy.maxHp}`;
            document.getElementById('enemyHpBar').style.width = `${(this.currentEnemy.hp / this.currentEnemy.maxHp) * 100}%`;

            document.getElementById('battleLog').innerHTML = '<p>전투 시작!</p>';
        },

        hideBattle() {
            document.getElementById('battleArea').classList.add('hidden');
            document.getElementById('explorationArea').style.display = 'block';
        },

        getRandomItem() {
            const items = [
                '체력 포션', '마나 포션', '고대의 부적', '신비한 보석',
                '강화된 검', '마법의 로브', '방어구 조각', '경험치 구슬'
            ];
            return items[Math.floor(Math.random() * items.length)];
        },

        getRandomEvent() {
            const events = [
                '신비한 분수를 발견했다. HP와 MP가 회복된다!',
                '고대의 벽화를 발견했다. 지력이 1 상승했다!',
                '수상한 상인을 만났다. 아이템을 거래할 수 있을 것 같다.',
                '빛나는 구체를 발견했다. 경험치를 100 획득했다!'
            ];

            const event = events[Math.floor(Math.random() * events.length)];

            if (event.includes('HP와 MP')) {
                game.player.hp = game.player.maxHp;
                game.player.mp = game.player.maxMp;
                game.updatePlayerStats();
            } else if (event.includes('지력')) {
                game.player.int += 1;
                game.updatePlayerStats();
            } else if (event.includes('경험치')) {
                game.player.exp += 100;
                game.checkLevelUp();
            }

            return event;
        },

        moveNorth() { this.move('north'); },
        moveSouth() { this.move('south'); },
        moveEast() { this.move('east'); },
        moveWest() { this.move('west'); },

        move(direction) {
            if (this.currentEnemy) {
                game.showModal('전투 중에는 이동할 수 없습니다!');
                return;
            }

            const nextRoom = this.currentRoom + (direction === 'north' ? 1 : direction === 'south' ? -1 : 0);

            if (nextRoom >= 0 && nextRoom < this.map.length) {
                this.enterRoom(nextRoom);
            } else {
                game.showModal('그 방향으로는 갈 수 없습니다.');
            }
        },

        exitLabyrinth() {
            if (confirm('정말로 미궁을 나가시겠습니까?')) {
                game.phase = 'day';
                game.day += 1;
                document.getElementById('dayCount').textContent = `Day ${game.day}`;
                document.getElementById('timePhase').textContent = '낮 - 아카데미';
                document.getElementById('labyrinthScreen').classList.remove('active');
                document.getElementById('labyrinthScreen').classList.add('hidden');
                document.getElementById('academyScreen').classList.remove('hidden');
                document.getElementById('academyScreen').classList.add('active');

                game.showModal(`미궁 탐사 종료! Day ${game.day}가 시작됩니다.`);
            }
        }
    },

    battle: {
        attack() {
            if (!game.labyrinth.currentEnemy) return;

            const damage = game.player.str + Math.floor(Math.random() * 10);
            game.labyrinth.currentEnemy.hp -= damage;

            const log = document.getElementById('battleLog');
            log.innerHTML += `<p>플레이어의 공격! ${damage}의 데미지!</p>`;

            if (game.labyrinth.currentEnemy.hp <= 0) {
                this.victory();
            } else {
                this.enemyAttack();
            }

            this.updateBattleDisplay();
        },

        useSkill() {
            if (!game.labyrinth.currentEnemy) return;

            if (game.player.mp < 10) {
                game.showModal('MP가 부족합니다!');
                return;
            }

            game.player.mp -= 10;
            const damage = game.player.int * 2 + Math.floor(Math.random() * 15);
            game.labyrinth.currentEnemy.hp -= damage;

            const log = document.getElementById('battleLog');
            log.innerHTML += `<p>스킬 발동! ${damage}의 마법 데미지!</p>`;

            if (game.labyrinth.currentEnemy.hp <= 0) {
                this.victory();
            } else {
                this.enemyAttack();
            }

            this.updateBattleDisplay();
            game.updatePlayerStats();
        },

        useItem() {
            const hasPotion = game.player.inventory.includes('체력 포션');

            if (!hasPotion) {
                game.showModal('사용할 수 있는 아이템이 없습니다!');
                return;
            }

            const index = game.player.inventory.indexOf('체력 포션');
            game.player.inventory.splice(index, 1);
            game.player.hp = Math.min(game.player.hp + 50, game.player.maxHp);

            const log = document.getElementById('battleLog');
            log.innerHTML += `<p>체력 포션을 사용했다! HP 50 회복!</p>`;

            this.enemyAttack();
            this.updateBattleDisplay();
            game.updatePlayerStats();
            game.updateInventory();
        },

        flee() {
            if (Math.random() < 0.5) {
                game.showModal('도망쳤다!');
                game.labyrinth.currentEnemy = null;
                game.labyrinth.hideBattle();
            } else {
                const log = document.getElementById('battleLog');
                log.innerHTML += `<p>도망치지 못했다!</p>`;
                this.enemyAttack();
            }
        },

        enemyAttack() {
            const damage = game.labyrinth.currentEnemy.attack + Math.floor(Math.random() * 5);
            game.player.hp -= damage;

            const log = document.getElementById('battleLog');
            log.innerHTML += `<p>${game.labyrinth.currentEnemy.name}의 공격! ${damage}의 데미지!</p>`;

            if (game.player.hp <= 0) {
                this.defeat();
            }

            game.updatePlayerStats();
        },

        victory() {
            const enemy = game.labyrinth.currentEnemy;
            game.player.exp += enemy.exp;
            game.player.inventory.push(enemy.drop);

            const log = document.getElementById('battleLog');
            log.innerHTML += `<p>승리! ${enemy.exp} EXP 획득! ${enemy.drop}을(를) 얻었다!</p>`;

            game.labyrinth.currentEnemy = null;
            game.checkLevelUp();
            game.updateInventory();

            setTimeout(() => {
                game.labyrinth.hideBattle();
            }, 2000);
        },

        defeat() {
            game.showModal('패배했다... 아카데미로 돌아갑니다.');
            game.player.hp = game.player.maxHp / 2;
            game.labyrinth.exitLabyrinth();
        },

        updateBattleDisplay() {
            if (game.labyrinth.currentEnemy) {
                const enemy = game.labyrinth.currentEnemy;
                document.getElementById('enemyHpText').textContent = `HP: ${Math.max(0, enemy.hp)}/${enemy.maxHp}`;
                document.getElementById('enemyHpBar').style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
            }

            const log = document.getElementById('battleLog');
            log.scrollTop = log.scrollHeight;
        }
    },

    init() {
        this.updatePlayerStats();
        this.updateRelationships();
        this.updateInventory();

        document.getElementById('storyText').innerHTML = `
            <p>특수 능력 아카데미에 입학한 당신.</p>
            <p>평범한 학원 생활을 꿈꾸었지만, 첫날 밤 꿈속에서 신비한 목소리를 듣게 됩니다.</p>
            <p>"선택받은 자여... 매일 밤 열리는 미궁을 탐사하고, 세계의 균열을 막아라..."</p>
            <p>낮에는 동료들과 인연을 쌓고, 밤에는 미궁을 탐사하는 이중 생활이 시작됩니다.</p>
        `;
    },

    moveToLocation(location) {
        this.location = location;
        const locationNames = {
            'classroom': '교실',
            'library': '도서관',
            'training': '훈련장',
            'dormitory': '기숙사'
        };

        document.getElementById('currentLocation').textContent = locationNames[location];

        let storyText = '';
        switch(location) {
            case 'classroom':
                storyText = '교실에서는 이론 수업이 진행됩니다. 지력을 올릴 수 있습니다.';
                this.player.int += 1;
                break;
            case 'library':
                storyText = '조용한 도서관. 미스티를 자주 볼 수 있는 곳입니다.';
                break;
            case 'training':
                storyText = '훈련장에서 몸을 단련합니다. 세라가 자주 있는 곳입니다.';
                this.player.str += 1;
                break;
            case 'dormitory':
                storyText = '기숙사에서 휴식을 취합니다. HP와 MP가 회복됩니다.';
                this.player.hp = Math.min(this.player.hp + 20, this.player.maxHp);
                this.player.mp = Math.min(this.player.mp + 10, this.player.maxMp);
                break;
        }

        document.getElementById('storyText').innerHTML = `<p>${storyText}</p>`;
        this.updatePlayerStats();

        if (Math.random() < 0.3 && this.phase === 'day') {
            this.triggerRandomEvent();
        }
    },

    talkToCharacter(heroineId) {
        const heroine = this.heroines[heroineId];
        const dialogueIndex = Math.min(Math.floor(heroine.affection / 20), heroine.dialogues.length - 1);
        const dialogue = heroine.dialogues[dialogueIndex];

        document.getElementById('characterInteraction').classList.remove('hidden');
        document.getElementById('characterName').textContent = heroine.name;
        document.getElementById('dialogueText').textContent = dialogue;

        heroine.affection = Math.min(heroine.affection + 5, heroine.maxAffection);
        this.updateRelationships();

        if (heroine.affection >= 50 && Math.random() < 0.3) {
            this.triggerSpecialEvent(heroineId);
        }
    },

    triggerRandomEvent() {
        const events = [
            '갑자기 밤이 되었다! 미궁의 문이 열린다...',
            '신비한 빛이 당신을 감싸며 모든 스탯이 1씩 상승했다!',
            '누군가 떨어뜨린 아이템을 발견했다!'
        ];

        const event = events[Math.floor(Math.random() * events.length)];

        if (event.includes('밤이 되었다')) {
            this.startLabyrinthPhase();
        } else if (event.includes('스탯')) {
            this.player.int += 1;
            this.player.charm += 1;
            this.player.str += 1;
            this.updatePlayerStats();
        } else if (event.includes('아이템')) {
            const item = this.labyrinth.getRandomItem();
            this.player.inventory.push(item);
            this.updateInventory();
        }

        this.showModal(event);
    },

    triggerSpecialEvent(heroineId) {
        const heroine = this.heroines[heroineId];
        const event = `${heroine.name}와(과)의 특별한 이벤트가 발생했습니다!`;

        this.player.charm += 2;
        heroine.affection += 10;

        this.updatePlayerStats();
        this.updateRelationships();
        this.showModal(event);
    },

    startLabyrinthPhase() {
        this.phase = 'night';
        document.getElementById('timePhase').textContent = '밤 - 미궁 탐사';
        document.getElementById('academyScreen').classList.remove('active');
        document.getElementById('academyScreen').classList.add('hidden');
        document.getElementById('labyrinthScreen').classList.remove('hidden');
        document.getElementById('labyrinthScreen').classList.add('active');

        this.labyrinth.generateMap();
        this.labyrinth.enterRoom(0);
    },

    updatePlayerStats() {
        document.getElementById('playerHpBar').style.width = `${(this.player.hp / this.player.maxHp) * 100}%`;
        document.getElementById('playerHpText').textContent = `${Math.max(0, this.player.hp)}/${this.player.maxHp}`;
        document.getElementById('playerMpBar').style.width = `${(this.player.mp / this.player.maxMp) * 100}%`;
        document.getElementById('playerMpText').textContent = `${Math.max(0, this.player.mp)}/${this.player.maxMp}`;
        document.getElementById('intStat').textContent = this.player.int;
        document.getElementById('charmStat').textContent = this.player.charm;
        document.getElementById('strStat').textContent = this.player.str;
        document.getElementById('expStat').textContent = this.player.exp;
    },

    updateRelationships() {
        for (let heroineId in this.heroines) {
            const heroine = this.heroines[heroineId];
            const affectionPercent = (heroine.affection / heroine.maxAffection) * 100;
            document.getElementById(`${heroineId}Affection`).style.width = `${affectionPercent}%`;
            document.getElementById(`${heroineId}AffectionText`).textContent = heroine.affection;
        }
    },

    updateInventory() {
        const inventoryList = document.getElementById('inventoryList');
        inventoryList.innerHTML = '';

        const itemCounts = {};
        this.player.inventory.forEach(item => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });

        for (let item in itemCounts) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.textContent = `${item} x${itemCounts[item]}`;
            itemDiv.onclick = () => this.useInventoryItem(item);
            inventoryList.appendChild(itemDiv);
        }
    },

    useInventoryItem(item) {
        if (this.phase === 'night' && this.labyrinth.currentEnemy) {
            this.battle.useItem();
            return;
        }

        if (item.includes('포션')) {
            if (item.includes('체력')) {
                this.player.hp = Math.min(this.player.hp + 50, this.player.maxHp);
                this.showModal('체력 포션을 사용했습니다. HP 50 회복!');
            } else if (item.includes('마나')) {
                this.player.mp = Math.min(this.player.mp + 25, this.player.maxMp);
                this.showModal('마나 포션을 사용했습니다. MP 25 회복!');
            }

            const index = this.player.inventory.indexOf(item);
            this.player.inventory.splice(index, 1);
            this.updateInventory();
            this.updatePlayerStats();
        } else {
            this.showModal(`${item}은(는) 지금 사용할 수 없습니다.`);
        }
    },

    checkLevelUp() {
        const expNeeded = this.player.level * 100;
        if (this.player.exp >= expNeeded) {
            this.player.level += 1;
            this.player.exp -= expNeeded;
            this.player.maxHp += 20;
            this.player.maxMp += 10;
            this.player.hp = this.player.maxHp;
            this.player.mp = this.player.maxMp;
            this.player.str += 2;
            this.player.int += 2;
            this.player.charm += 1;

            this.showModal(`레벨 업! 현재 레벨: ${this.player.level}`);
            this.updatePlayerStats();
        }
    },

    showModal(message) {
        document.getElementById('modalText').textContent = message;
        document.getElementById('modalOverlay').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
    },

    saveGame() {
        const saveData = {
            day: this.day,
            phase: this.phase,
            location: this.location,
            player: this.player,
            heroines: this.heroines
        };
        localStorage.setItem('labyrinthAcademySave', JSON.stringify(saveData));
        this.showModal('게임이 저장되었습니다!');
    },

    loadGame() {
        const saveData = localStorage.getItem('labyrinthAcademySave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.day = data.day;
            this.phase = data.phase;
            this.location = data.location;
            this.player = data.player;
            this.heroines = data.heroines;

            document.getElementById('dayCount').textContent = `Day ${this.day}`;
            this.updatePlayerStats();
            this.updateRelationships();
            this.updateInventory();
            this.showModal('게임이 로드되었습니다!');
        } else {
            this.showModal('저장된 게임이 없습니다.');
        }
    }
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && game.phase === 'night' && !game.labyrinth.currentEnemy) {
        game.startLabyrinthPhase();
    } else if (e.key === 'Escape' && game.phase === 'night') {
        game.labyrinth.exitLabyrinth();
    } else if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        game.saveGame();
    } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        game.loadGame();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    game.init();

    const savedGame = localStorage.getItem('labyrinthAcademySave');
    if (savedGame) {
        if (confirm('저장된 게임이 있습니다. 불러오시겠습니까?')) {
            game.loadGame();
        }
    }
});

console.log('Labyrinth Academy - Game Loaded');
console.log('Controls: Ctrl+S to save, Ctrl+L to load, Enter to start night phase, Esc to exit labyrinth');