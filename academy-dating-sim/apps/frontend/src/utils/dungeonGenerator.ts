// Random Dungeon Generation System

export interface DungeonCell {
  type: number; // 0=empty, 1=wall, 2=trap, 3=treasure, 4=stairs, 5=monster, 6=boss
  visited: boolean;
  revealed: boolean;
}

export interface DungeonFloor {
  layout: number[][];
  startPosition: { x: number; y: number };
  bossPosition: { x: number; y: number };
  treasures: { x: number; y: number }[];
  traps: { x: number; y: number }[];
  monsters: { x: number; y: number }[];
  theme: string;
}

export class DungeonGenerator {
  private width: number;
  private height: number;
  private difficulty: number;
  private theme: string;

  constructor(width: number = 15, height: number = 15, difficulty: number = 1, theme: string = 'forest') {
    this.width = width;
    this.height = height;
    this.difficulty = difficulty;
    this.theme = theme;
  }

  // Generate a complete dungeon floor
  generateFloor(): DungeonFloor {
    const layout = this.createEmptyLayout();
    this.generateRooms(layout);
    this.generateCorridors(layout);
    this.placeSpecialCells(layout);

    const startPosition = this.findValidPosition(layout, 0);
    const bossPosition = this.findFarthestPosition(layout, startPosition);

    // Mark boss position
    layout[bossPosition.y][bossPosition.x] = 6;

    // Place stairs near boss
    const stairsPos = this.findNearbyPosition(layout, bossPosition, 0);
    if (stairsPos) {
      layout[stairsPos.y][stairsPos.x] = 4;
    }

    // Extract special positions
    const treasures: { x: number; y: number }[] = [];
    const traps: { x: number; y: number }[] = [];
    const monsters: { x: number; y: number }[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        switch (layout[y][x]) {
          case 2:
            traps.push({ x, y });
            break;
          case 3:
            treasures.push({ x, y });
            break;
          case 5:
            monsters.push({ x, y });
            break;
        }
      }
    }

    return {
      layout,
      startPosition,
      bossPosition,
      treasures,
      traps,
      monsters,
      theme: this.theme
    };
  }

  // Create empty layout filled with walls
  private createEmptyLayout(): number[][] {
    return Array(this.height).fill(null).map(() => Array(this.width).fill(1));
  }

  // Generate rooms using Binary Space Partitioning
  private generateRooms(layout: number[][]) {
    const rooms: { x: number; y: number; width: number; height: number }[] = [];
    const minRoomSize = 3;
    const maxRoomSize = 7;

    // Generate 3-8 rooms based on difficulty
    const roomCount = Math.floor(3 + Math.random() * (3 + this.difficulty));

    for (let i = 0; i < roomCount; i++) {
      const roomWidth = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize));
      const roomHeight = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize));
      const x = 1 + Math.floor(Math.random() * (this.width - roomWidth - 2));
      const y = 1 + Math.floor(Math.random() * (this.height - roomHeight - 2));

      // Check if room overlaps
      let overlaps = false;
      for (const room of rooms) {
        if (x < room.x + room.width + 1 &&
            x + roomWidth + 1 > room.x &&
            y < room.y + room.height + 1 &&
            y + roomHeight + 1 > room.y) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        rooms.push({ x, y, width: roomWidth, height: roomHeight });

        // Carve out room
        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            layout[ry][rx] = 0;
          }
        }
      }
    }

    return rooms;
  }

  // Generate corridors between rooms
  private generateCorridors(layout: number[][]) {
    const rooms = this.findRooms(layout);

    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
      const room1 = rooms[i];
      const room2 = rooms[i + 1];

      const center1 = {
        x: Math.floor(room1.x + room1.width / 2),
        y: Math.floor(room1.y + room1.height / 2)
      };

      const center2 = {
        x: Math.floor(room2.x + room2.width / 2),
        y: Math.floor(room2.y + room2.height / 2)
      };

      // Create L-shaped corridor
      if (Math.random() < 0.5) {
        this.createHorizontalCorridor(layout, center1.x, center2.x, center1.y);
        this.createVerticalCorridor(layout, center1.y, center2.y, center2.x);
      } else {
        this.createVerticalCorridor(layout, center1.y, center2.y, center1.x);
        this.createHorizontalCorridor(layout, center1.x, center2.x, center2.y);
      }
    }
  }

  private createHorizontalCorridor(layout: number[][], x1: number, x2: number, y: number) {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);

    for (let x = start; x <= end; x++) {
      if (y > 0 && y < this.height - 1) {
        layout[y][x] = 0;
      }
    }
  }

  private createVerticalCorridor(layout: number[][], y1: number, y2: number, x: number) {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);

    for (let y = start; y <= end; y++) {
      if (x > 0 && x < this.width - 1) {
        layout[y][x] = 0;
      }
    }
  }

  // Place special cells (treasures, traps, monsters)
  private placeSpecialCells(layout: number[][]) {
    const emptyCells = this.findEmptyCells(layout);

    // Calculate counts based on difficulty
    const treasureCount = 2 + Math.floor(Math.random() * (2 + this.difficulty));
    const trapCount = 1 + Math.floor(Math.random() * (2 + this.difficulty));
    const monsterCount = 3 + Math.floor(Math.random() * (3 + this.difficulty));

    // Shuffle empty cells
    const shuffled = [...emptyCells].sort(() => Math.random() - 0.5);
    let index = 0;

    // Place treasures
    for (let i = 0; i < treasureCount && index < shuffled.length; i++) {
      const pos = shuffled[index++];
      layout[pos.y][pos.x] = 3;
    }

    // Place traps
    for (let i = 0; i < trapCount && index < shuffled.length; i++) {
      const pos = shuffled[index++];
      layout[pos.y][pos.x] = 2;
    }

    // Place monsters
    for (let i = 0; i < monsterCount && index < shuffled.length; i++) {
      const pos = shuffled[index++];
      layout[pos.y][pos.x] = 5;
    }
  }

  // Find all empty cells
  private findEmptyCells(layout: number[][]): { x: number; y: number }[] {
    const cells: { x: number; y: number }[] = [];

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (layout[y][x] === 0) {
          cells.push({ x, y });
        }
      }
    }

    return cells;
  }

  // Find rooms in the layout
  private findRooms(layout: number[][]): { x: number; y: number; width: number; height: number }[] {
    const rooms: { x: number; y: number; width: number; height: number }[] = [];
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (layout[y][x] === 0 && !visited[y][x]) {
          // Found a room, measure its size
          let width = 0;
          let height = 0;

          // Measure width
          for (let rx = x; rx < this.width && layout[y][rx] === 0; rx++) {
            width++;
          }

          // Measure height
          for (let ry = y; ry < this.height && layout[ry][x] === 0; ry++) {
            height++;
          }

          // Mark as visited
          for (let ry = y; ry < y + height; ry++) {
            for (let rx = x; rx < x + width; rx++) {
              visited[ry][rx] = true;
            }
          }

          if (width >= 3 && height >= 3) {
            rooms.push({ x, y, width, height });
          }
        }
      }
    }

    return rooms;
  }

  // Find a valid empty position
  private findValidPosition(layout: number[][], targetType: number): { x: number; y: number } {
    const validCells = [];

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (layout[y][x] === targetType) {
          validCells.push({ x, y });
        }
      }
    }

    return validCells[Math.floor(Math.random() * validCells.length)] || { x: 1, y: 1 };
  }

  // Find the farthest position from a given point
  private findFarthestPosition(layout: number[][], from: { x: number; y: number }): { x: number; y: number } {
    let farthest = { x: 1, y: 1 };
    let maxDistance = 0;

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (layout[y][x] === 0) {
          const distance = Math.abs(x - from.x) + Math.abs(y - from.y);
          if (distance > maxDistance) {
            maxDistance = distance;
            farthest = { x, y };
          }
        }
      }
    }

    return farthest;
  }

  // Find a nearby empty position
  private findNearbyPosition(layout: number[][], from: { x: number; y: number }, targetType: number): { x: number; y: number } | null {
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }
    ];

    for (const dir of directions) {
      const x = from.x + dir.dx;
      const y = from.y + dir.dy;

      if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1 && layout[y][x] === targetType) {
        return { x, y };
      }
    }

    return null;
  }

  // Generate a simple maze using recursive backtracking
  static generateMaze(width: number, height: number): number[][] {
    const maze = Array(height).fill(null).map(() => Array(width).fill(1));
    const stack: { x: number; y: number }[] = [];
    const start = { x: 1, y: 1 };

    maze[start.y][start.x] = 0;
    stack.push(start);

    const directions = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 }
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const unvisited = [];

      for (const dir of directions) {
        const next = { x: current.x + dir.dx, y: current.y + dir.dy };

        if (next.x > 0 && next.x < width - 1 &&
            next.y > 0 && next.y < height - 1 &&
            maze[next.y][next.x] === 1) {
          unvisited.push({ next, wall: { x: current.x + dir.dx / 2, y: current.y + dir.dy / 2 } });
        }
      }

      if (unvisited.length > 0) {
        const chosen = unvisited[Math.floor(Math.random() * unvisited.length)];
        maze[chosen.wall.y][chosen.wall.x] = 0;
        maze[chosen.next.y][chosen.next.x] = 0;
        stack.push(chosen.next);
      } else {
        stack.pop();
      }
    }

    return maze;
  }
}

export default DungeonGenerator;