import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Board, Piece, Shape } from "./types";
import { CLEAR_SCORES, speedForLevel } from "./constants";
import {
    canPlace,
    clearLines,
    createPiece,
    emptyBoard,
    merge,
    nextBag,
    overlay,
    tryRotateWithKicks,
} from "./utils";

export function useTetris() {
    const [board, setBoard] = useState<Board>(() => emptyBoard());
    const [current, setCurrent] = useState<Piece | null>(null);
    const [queue, setQueue] = useState<Shape[]>(() => nextBag());
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);
    const [lines, setLines] = useState(0);
    const [isPaused, setPaused] = useState(false);
    const [isGameOver, setGameOver] = useState(false);

    const tickRef = useRef<number | null>(null);

    const nextShape = useMemo<Shape>(() => queue[0] ?? [], [queue]);
    const viewBoard = useMemo(() => overlay(board, current), [board, current]);

    const refillQueueIfNeeded = useCallback(() => {
        setQueue((q) => (q.length <= 3 ? [...q, ...nextBag()] : q));
    }, []);

    const spawn = useCallback(() => {
        setQueue((q) => {
            const [head, ...rest] = q;
            const piece = createPiece(head);
            // Если не влазит — game over
            if (!canPlace(board, piece)) {
                setGameOver(true);
                return q; // неважно уже
            }
            setCurrent(piece);
            return rest;
        });
    }, [board]);

    const startOrRestart = useCallback(() => {
        setBoard(emptyBoard());
        setCurrent(null);
        setQueue(nextBag());
        setScore(0);
        setLevel(0);
        setLines(0);
        setPaused(false);
        setGameOver(false);
    }, []);

    // Основной цикл
    useEffect(() => {
        if (isPaused || isGameOver) return;

        // при отсутствии текущей фигуры — спавним
        if (!current) {
            spawn();
            return;
        }

        const speed = speedForLevel(level);
        const id = window.setInterval(() => {
            setCurrent((cur) => {
                if (!cur) return cur;
                const moved = { ...cur, y: cur.y + 1 };
                if (canPlace(board, moved)) return moved;

                // Лочим фигуру
                const merged = merge(board, cur);
                const { newBoard, lines: cleared } = clearLines(merged);

                setBoard(newBoard);
                if (cleared > 0) {
                    setLines((l) => {
                        const newLines = l + cleared;
                        const newLevel = Math.floor(newLines / 10);
                        setLevel(newLevel);
                        return newLines;
                    });

                    // ✅ без any
                    const bonus = CLEAR_SCORES[cleared as 1 | 2 | 3 | 4] ?? 0;
                    setScore((s) => s + bonus * (level + 1));
                }

                // Новая фигура
                const next = queue[0];
                const rest = queue.slice(1);
                const newPiece = createPiece(next);
                if (!canPlace(newBoard, newPiece)) {
                    setGameOver(true);
                    return null;
                }
                setQueue(rest);
                return newPiece;
            });
            refillQueueIfNeeded();
        }, speed);

        tickRef.current = id;
        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [board, current, isPaused, isGameOver, level, queue, refillQueueIfNeeded, spawn]);

    const moveLeft = useCallback(() => {
        if (!current || isPaused || isGameOver) return;
        const candidate = { ...current, x: current.x - 1 };
        if (canPlace(board, candidate)) setCurrent(candidate);
    }, [board, current, isPaused, isGameOver]);

    const moveRight = useCallback(() => {
        if (!current || isPaused || isGameOver) return;
        const candidate = { ...current, x: current.x + 1 };
        if (canPlace(board, candidate)) setCurrent(candidate);
    }, [board, current, isPaused, isGameOver]);

    const softDrop = useCallback(() => {
        if (!current || isPaused || isGameOver) return;
        const candidate = { ...current, y: current.y + 1 };
        if (canPlace(board, candidate)) setCurrent(candidate);
    }, [board, current, isPaused, isGameOver]);

    const hardDrop = useCallback(() => {
        if (!current || isPaused || isGameOver) return;
        let drop = { ...current };
        while (canPlace(board, { ...drop, y: drop.y + 1 })) {
            drop = { ...drop, y: drop.y + 1 };
        }
        // Лочим
        const merged = merge(board, drop);
        const { newBoard, lines: cleared } = clearLines(merged);
        setBoard(newBoard);
        if (cleared > 0) {
            setLines((l) => {
                const newLines = l + cleared;
                const newLevel = Math.floor(newLines / 10);
                setLevel(newLevel);
                return newLines;
            });

            // ✅ без any (второе место)
            const bonus = CLEAR_SCORES[cleared as 1 | 2 | 3 | 4] ?? 0;
            setScore((s) => s + bonus * (level + 1));
        }
        // Новая фигура
        const next = queue[0];
        const rest = queue.slice(1);
        const newPiece = createPiece(next);
        if (!canPlace(newBoard, newPiece)) {
            setGameOver(true);
            setCurrent(null);
            return;
        }
        setQueue(rest);
        setCurrent(newPiece);
        refillQueueIfNeeded();
    }, [board, current, isPaused, isGameOver, level, queue, refillQueueIfNeeded]);

    const rotateCWAction = useCallback(() => {
        if (!current || isPaused || isGameOver) return;
        const rotated = tryRotateWithKicks(board, current);
        if (rotated) setCurrent(rotated);
    }, [board, current, isPaused, isGameOver]);

    const togglePause = useCallback(() => {
        if (isGameOver) return;
        setPaused((p) => !p);
    }, [isGameOver]);

    // При старте, если current пуст, заспавнить
    useEffect(() => {
        if (!current && !isGameOver) spawn();
    }, [current, isGameOver, spawn]);

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
        rotateCW: rotateCWAction,
    };
}
