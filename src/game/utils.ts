import { Board, Piece, Shape } from "./types";
import { COLS, ROWS, TETROMINOES } from "./constants";

export const emptyBoard = (): Board =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export function rotateCW(shape: Shape): Shape {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            rotated[x][rows - 1 - y] = shape[y][x];
        }
    }
    return rotated;
}

export function canPlace(board: Board, piece: Piece): boolean {
    const { shape, x: px, y: py } = piece;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
            const cell = shape[y][x];
            if (!cell) continue;
            const bx = px + x;
            const by = py + y;
            if (bx < 0 || bx >= COLS || by >= ROWS) return false;
            if (by >= 0 && board[by][bx] !== 0) return false;
        }
    }
    return true;
}

export function merge(board: Board, piece: Piece): Board {
    const newBoard = board.map((row) => row.slice());
    const { shape, x: px, y: py } = piece;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
            if (shape[y][x]) {
                const by = py + y;
                const bx = px + x;
                if (by >= 0) newBoard[by][bx] = piece.id;
            }
        }
    }
    return newBoard;
}

export function clearLines(board: Board): { newBoard: Board; lines: number } {
    const remain = board.filter((row) => row.some((v) => v === 0));
    const linesCleared = ROWS - remain.length;
    const padded = Array.from({ length: linesCleared }, () => Array(COLS).fill(0));
    return { newBoard: [...padded, ...remain], lines: linesCleared };
}

// 7-bag генератор
function shuffled<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function nextBag(): number[][][] {
    const ids = [0, 1, 2, 3, 4, 5, 6]; // индексы TETROMINOES
    return shuffled(ids).map((i) => TETROMINOES[i]);
}

export function createPiece(shape: Shape): Piece {
    // Начальная позиция по центру
    const id = shape.flat().find((v) => v)!; // взять ненулевое значение как id
    const width = shape[0].length;
    const startX = Math.floor((COLS - width) / 2);
    return { shape, x: startX, y: -2, id };
}

export function tryRotateWithKicks(board: Board, piece: Piece): Piece | null {
    const rotated = rotateCW(piece.shape);
    const kicks = [0, -1, 1, -2, 2];
    for (const dx of kicks) {
        const candidate: Piece = { ...piece, shape: rotated, x: piece.x + dx };
        if (canPlace(board, candidate)) return candidate;
    }
    return null;
}

export function overlay(board: Board, piece: Piece | null): Board {
    if (!piece) return board;
    const view = board.map((r) => r.slice());
    const { shape, x: px, y: py, id } = piece;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
            if (shape[y][x]) {
                const by = py + y;
                const bx = px + x;
                if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                    view[by][bx] = id;
                }
            }
        }
    }
    return view;
}
