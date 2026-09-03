import { useEffect } from "react";
import "../styles/tetris.scss";
import Board from "../components/Board";
import Sidebar from "../components/Sidebar";
import NextPreview from "../components/NextPreview";
import ControlsHint from "../components/ControlsHint";
import DesktopOnlyGuard from "../components/DesktopOnlyGuard";
import { useTetris } from "../game/useTetris";

// Ориентируемся на e.code, а не на e.key: иначе P и R не работают
// на нелатинской раскладке
const HANDLED_CODES = new Set([
    "ArrowLeft",
    "ArrowRight",
    "ArrowDown",
    "ArrowUp",
    "Space",
    "KeyP",
    "KeyR",
]);
const REPEATABLE_CODES = new Set(["ArrowLeft", "ArrowRight", "ArrowDown"]);

export default function App() {
    const {
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
    } = useTetris();

    // Глобальные клавиши
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!HANDLED_CODES.has(e.code)) return;
            // стрелки и пробел иначе прокручивают страницу, а пробел ещё и
            // «нажимает» кнопку, оказавшуюся в фокусе
            e.preventDefault();
            // автоповтор ОС нужен только для перемещения: с ним удержание
            // пробела роняло фигуру за фигурой, а P мигал паузой
            if (e.repeat && !REPEATABLE_CODES.has(e.code)) return;

            if (isGameOver) {
                if (e.code === "KeyR" || e.code === "Space") startOrRestart();
                return;
            }
            if (e.code === "ArrowLeft") moveLeft();
            else if (e.code === "ArrowRight") moveRight();
            else if (e.code === "ArrowDown") softDrop();
            else if (e.code === "ArrowUp") rotateCW();
            else if (e.code === "Space") hardDrop();
            else if (e.code === "KeyP") togglePause();
            else if (e.code === "KeyR") startOrRestart();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [
        isGameOver,
        moveLeft,
        moveRight,
        softDrop,
        rotateCW,
        hardDrop,
        togglePause,
        startOrRestart,
    ]);

    return (
        <DesktopOnlyGuard>
            <div className="t3chtris">
                <header className="t3chtris__header">
                    <h1>
                        t3ch<span>tris</span>
                    </h1>
                    <div className="header-actions">
                        <button className="btn ghost" onClick={startOrRestart}>
                            {isGameOver ? "Начать заново" : "Рестарт (R)"}
                        </button>
                        <button className="btn" onClick={togglePause}>
                            {isPaused ? "Продолжить (P)" : "Пауза (P)"}
                        </button>
                    </div>
                </header>

                <main className="t3chtris__main">
                    <Sidebar score={score} level={level} lines={lines} />
                    <Board
                        board={viewBoard}
                        isGameOver={isGameOver}
                        isPaused={isPaused}
                    />
                    <NextPreview shape={nextShape} />
                </main>

                <footer className="t3chtris__footer">
                    <ControlsHint />
                </footer>
            </div>
        </DesktopOnlyGuard>
    );
}
