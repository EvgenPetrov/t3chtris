import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Board, Piece, Shape } from "./types";
import {
    QUEUE_REFILL_THRESHOLD,
    levelForLines,
    scoreForClear,
    speedForLevel,
} from "./constants";
import {
    canPlace,
    clearLines,
    createPiece,
    emptyBoard,
    isLockedOut,
    merge,
    nextBag,
    overlay,
    tryRotateWithKicks,
} from "./utils";

const EMPTY_SHAPE: Shape = [];

const withRefill = (queue: Shape[]): Shape[] =>
    queue.length <= QUEUE_REFILL_THRESHOLD ? [...queue, ...nextBag()] : queue;

export function useTetris() {
    const [board, setBoard] = useState<Board>(emptyBoard);
    const [current, setCurrent] = useState<Piece | null>(null);
    const [queue, setQueue] = useState<Shape[]>(nextBag);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [isPaused, setPaused] = useState(false);
    const [isGameOver, setGameOver] = useState(false);

    // Уровень полностью определяется числом линий — отдельное состояние не нужно
    const level = levelForLines(lines);

    const nextShape = queue[0] ?? EMPTY_SHAPE;
    const viewBoard = useMemo(() => overlay(board, current), [board, current]);

    // Актуальное состояние для тика таймера: интервал не пересоздаётся
    // на каждое движение игрока, поэтому гравитация идёт ровно
    const gameRef = useRef({ board, current, queue, level });
    useEffect(() => {
        gameRef.current = { board, current, queue, level };
    });

    // Фиксация фигуры: очистка линий, очки и выдача следующей фигуры
    const lockAndAdvance = useCallback((piece: Piece) => {
        const { board, queue, level } = gameRef.current;

        if (isLockedOut(piece)) {
            setCurrent(null);
            setGameOver(true);
            return;
        }

        const { newBoard, lines: cleared } = clearLines(merge(board, piece));
        setBoard(newBoard);
        if (cleared > 0) {
            setLines((l) => l + cleared);
            setScore((s) => s + scoreForClear(cleared, level));
        }

        const [head, ...rest] = queue;
        const nextPiece = createPiece(head);
        if (!canPlace(newBoard, nextPiece)) {
            setCurrent(null);
            setGameOver(true);
            return;
        }
        setQueue(withRefill(rest));
        setCurrent(nextPiece);
    }, []);

    // Первая фигура после старта и рестарта. Читает очередь из текущего рендера,
    // поэтому повторный вызов в том же коммите выдаёт ту же фигуру
    const spawn = useCallback(() => {
        const [head, ...rest] = queue;
        const piece = createPiece(head);
        if (!canPlace(board, piece)) {
            setGameOver(true);
            return;
        }
        setCurrent(piece);
        setQueue(withRefill(rest));
    }, [board, queue]);

    const startOrRestart = useCallback(() => {
        setBoard(emptyBoard());
        setCurrent(null);
        setQueue(nextBag());
        setScore(0);
        setLines(0);
        setPaused(false);
        setGameOver(false);
    }, []);

    useEffect(() => {
        if (!current && !isGameOver) spawn();
    }, [current, isGameOver, spawn]);

    // Основной цикл
    useEffect(() => {
        if (isPaused || isGameOver) return;

        const id = window.setInterval(() => {
            const { board, current } = gameRef.current;
            if (!current) return;

            const moved = { ...current, y: current.y + 1 };
            if (canPlace(board, moved)) setCurrent(moved);
            else lockAndAdvance(current);
        }, speedForLevel(level));

        return () => window.clearInterval(id);
    }, [isPaused, isGameOver, level, lockAndAdvance]);

    // Уход на другую вкладку ставит паузу; снимает её игрок сам
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.hidden) setPaused(true);
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () =>
            document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

    const moveBy = useCallback(
        (dx: number, dy: number) => {
            if (!current || isPaused || isGameOver) return;
            const candidate = { ...current, x: current.x + dx, y: current.y + dy };
            if (canPlace(board, candidate)) setCurrent(candidate);
        },
        [board, current, isPaused, isGameOver]
    );

    const moveLeft = useCallback(() => moveBy(-1, 0), [moveBy]);
    const moveRight = useCallback(() => moveBy(1, 0), [moveBy]);
    const softDrop = useCallback(() => moveBy(0, 1), [moveBy]);

    const hardDrop = useCallback(() => {
        if (!current || isPaused || isGameOver) return;
        let drop = current;
        while (canPlace(board, { ...drop, y: drop.y + 1 })) {
            drop = { ...drop, y: drop.y + 1 };
        }
        lockAndAdvance(drop);
    }, [board, current, isPaused, isGameOver, lockAndAdvance]);

    const rotateCW = useCallback(() => {
        if (!current || isPaused || isGameOver) return;
        const rotated = tryRotateWithKicks(board, current);
        if (rotated) setCurrent(rotated);
    }, [board, current, isPaused, isGameOver]);

    const togglePause = useCallback(() => {
        if (isGameOver) return;
        setPaused((p) => !p);
    }, [isGameOver]);

    return {
        viewBoard,
        nextShape,
        score,
        level,
        lines,
        isGameOver,
        isPaused,
        startOrRestart,
        togglePause,
        hardDrop,
        softDrop,
        moveLeft,
        moveRight,
        rotateCW,
    };
}
