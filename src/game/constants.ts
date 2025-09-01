export const COLS = 10;
export const ROWS = 20;

// Скорость падающей фигуры (мс) = clamp(800 - level*80, 100..800)
export const speedForLevel = (level: number) => Math.max(100, 800 - level * 80);

// Базовые очки за очищение линий (как в классике)
export const CLEAR_SCORES: Record<1 | 2 | 3 | 4, number> = {
    1: 100,
    2: 300,
    3: 500,
    4: 800,
};

// Матрицы тетромино (значение >0 = id цвета)
export const TETROMINOES: number[][][] = [
    // I (id 1)
    [[1, 1, 1, 1]],
    // J (id 2)
    [
        [2, 0, 0],
        [2, 2, 2],
    ],
    // L (id 3)
    [
        [0, 0, 3],
        [3, 3, 3],
    ],
    // O (id 4)
    [
        [4, 4],
        [4, 4],
    ],
    // S (id 5)
    [
        [0, 5, 5],
        [5, 5, 0],
    ],
    // T (id 6)
    [
        [0, 6, 0],
        [6, 6, 6],
    ],
    // Z (id 7)
    [
        [7, 7, 0],
        [0, 7, 7],
    ],
];
