type Props = {
    score: number;
    level: number;
    lines: number;
};

export default function Sidebar({ score, level, lines }: Props) {
    return (
        <aside className="sidebar">
            <div className="panel">
                <h4>Счёт</h4>
                <div className="metric">{score}</div>
            </div>
            <div className="panel">
                <h4>Уровень</h4>
                <div className="metric">{level}</div>
            </div>
            <div className="panel">
                <h4>Линии</h4>
                <div className="metric">{lines}</div>
            </div>
        </aside>
    );
}
