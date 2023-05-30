import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import useStores from "../../hooks/useStore";

const LogViewer = ({ container_id }: { container_id: string }) => {
    const scrollRef = useRef<HTMLInputElement>(null);
    const { containerStore, logStore, tabStore } = useStores();
    const [scrollToBottom, setScrollToBottom] = useState(true);

    let logs = logStore.logs.get(container_id);

    const classifier = (log: string): string => {
        if (log.toLocaleLowerCase().includes("info")) {
            return "text-green-500";
        }
        if (log.toLocaleLowerCase().includes("debug")) {
            return "text-blue-500";
        }
        if (log.toLocaleLowerCase().includes("warn")) {
            return "text-orange-500";
        }
        if (log.toLocaleLowerCase().includes("error")) {
            return "text-red-500";
        }
        return "text-white";
    };

    useEffect(() => {
        if (scrollToBottom) {
            //@ts-ignore
            scrollRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [logs?.length]);

    const onScrollPause = (e: any) => {
        const element: any = e.target;
        if (element.scrollTop === element.scrollHeight - element.clientHeight) {
            setScrollToBottom(true);
        } else {
            setScrollToBottom(false);
        }
    };

    return (
        <div className="w-full h-full flex text-bl text-white flex-col overflow-hidden">
            <div className="overflow-y-auto px-2" onScroll={onScrollPause}>
                {logs?.map((c, i) => (
                    <div
                        style={
                            i == logs?.length
                                ? {
                                      scrollSnapAlign: "end",
                                      scrollMarginBlockEnd: "5rem",
                                  }
                                : {}
                        }
                        key={i}
                        className={classifier(c.message)}
                    >
                        {c.message}
                    </div>
                ))}
                <div ref={scrollRef} style={{ height: 1 }} />
            </div>
        </div>
    );
};

export default observer(LogViewer);
