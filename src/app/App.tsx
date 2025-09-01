import { useEffect } from "react";
import "../styles/tetris.scss";
import Board from "../components/Board";
import Sidebar from "../components/Sidebar";
import NextPreview from "../components/NextPreview";
import ControlsHint from "../components/ControlsHint";
import DesktopOnlyGuard from "../components/DesktopOnlyGuard";
import { useTetris } from "../game/useTetris";

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
            if (isGameOver) {
                if (e.key.toLowerCase() === "r" || e.key === " ") startOrRestart();
                return;
            }
            if (e.key === "ArrowLeft") moveLeft();
            else if (e.key === "ArrowRight") moveRight();
            else if (e.key === "ArrowDown") softDrop();
            else if (e.key === "ArrowUp") rotateCW();
            else if (e.key === " ") hardDrop();
            else if (e.key.toLowerCase() === "p") togglePause();
            else if (e.key.toLowerCase() === "r") startOrRestart();
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
