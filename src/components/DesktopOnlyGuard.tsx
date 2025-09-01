import { ReactNode, useEffect, useState } from "react";

const DESKTOP_MIN_WIDTH = 992;

export default function DesktopOnlyGuard({ children }: { children: ReactNode }) {
    const [isDesktop, setIsDesktop] = useState<boolean>(true);

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= DESKTOP_MIN_WIDTH);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    if (!isDesktop) {
        return (
            <div
                style={{
                    minHeight: "100dvh",
                    display: "grid",
                    placeItems: "center",
                    background: "#0b0f14",
                    color: "#c8d5f2",
                    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
                    padding: "24px",
                    textAlign: "center",
                }}>
                <div>
                    <h2 style={{ marginBottom: 8, fontWeight: 800 }}>
                        Доступно только на десктопе
                    </h2>
                    <p>Пожалуйста, откройте игру на экране шире 992px.</p>
                </div>
            </div>
        );
    }
    return <>{children}</>;
}
