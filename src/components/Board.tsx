import Cell from "./Cell";

type Props = {
    board: number[][];
    isGameOver: boolean;
    isPaused: boolean;
};

export default function Board({ board, isGameOver, isPaused }: Props) {
    return (
        <div className="board-wrap">
            <div className="board">
                {board.map((row, y) =>
                    row.map((val, x) => <Cell key={`${y}-${x}`} value={val} />)
                )}
            </div>

            {isPaused && !isGameOver && (
                <div className="overlay">
                    <div className="overlay__card">
                        <h3>Пауза</h3>
                        <p>
                            Нажмите <b>P</b> для продолжения
                        </p>
                    </div>
                </div>
            )}

            {isGameOver && (
                <div className="overlay">
                    <div className="overlay__card">
                        <h3>Игра окончена</h3>
                        <p>
                            Нажмите <b>R</b> или <b>Space</b> для рестарта
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
