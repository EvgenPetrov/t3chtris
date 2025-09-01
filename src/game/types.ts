export type Board = number[][];
export type Shape = number[][];

export type Piece = {
    shape: Shape;
    x: number;
    y: number;
    id: number; // 1..7 — для цвета
};
