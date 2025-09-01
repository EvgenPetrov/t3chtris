type Props = {
    value: number;
};

export default function Cell({ value }: Props) {
    const className = value === 0 ? "cell" : `cell cell--c${value}`;
    return <div className={className} />;
}
