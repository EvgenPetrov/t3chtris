type Props = {
    shape: number[][];
};

export default function NextPreview({ shape }: Props) {
    // Нормируем в 4x4 превью
    const size = 4;
    const preview = Array.from({ length: size }, () => Array(size).fill(0));
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
            if (y < size && x < size) preview[y][x] = shape[y][x];
        }
    }

    return (
        <aside className="next">
            <div className="panel">
                <h4>Следующая</h4>
                <div className="next__grid">
                    {preview.map((row, y) =>
                        row.map((val, x) => (
                            <div
                                key={`${y}-${x}`}
                                className={val ? `cell cell--c${val}` : "cell"}
                            />
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}
