import { observer } from "mobx-react";
import useStores from "../../hooks/useStore";
import { useEffect, useRef, useState } from "react";
import Docker from "../../components/icons/docker";
import { FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import AnsiConvertor from "ansi-to-html";
import { groupBy } from "lodash";

function LogPane({ container_id, tab }: { container_id: string; tab: Tab }) {
    const ansiConvertor = new AnsiConvertor({
        escapeXML: false,
        fg: "var(--text-color)",
    });

    const { containerStore, tabStore, logStore } = useStores();
    const scrollRef = useRef<HTMLInputElement>(null);
    const [scrollToBottom, setScrollToBottom] = useState(true);
    const container = containerStore.all_containers.find(
        (c) => c.id === container_id
    ) as Container;
    let logs = logStore.logs.get(container_id);
    let sliced_log = logs;

    const closePane = () => {
        tabStore.closePane(tab);
    };

    const classifier = (log: string): string => {
        const base = "flex flex-row ";
        if (log.toLocaleLowerCase().includes("info")) {
            return base + "text-green-500";
        }
        if (log.toLocaleLowerCase().includes("debug")) {
            return base + "text-blue-500";
        }
        if (log.toLocaleLowerCase().includes("warn")) {
            return base + "text-orange-500";
        }
        if (log.toLocaleLowerCase().includes("error")) {
            return base + "text-red-500";
        }
        return base + "text-white";
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
        <div className="w-full h-full bg-[#1D1D1D] border border-[#292929] overflow-hidden rounded">
            <div className="w-full h-[48px] flex flex-row items-center text-white p-2 gap-2 border-b border-[#292929] px-3">
                <div className="w-[24px] h-[24px] fill-white">
                    <Docker />
                </div>
                {container.name} - {container.created_at.toISOString()}
                <div className="flex-grow"></div>
                <div className="w-[12px] h-[32px] text-[18px] text-[white] cursor-pointer flex flex-row items-center justify-center">
                    <FaTrash />
                </div>
                <div
                    onClick={closePane}
                    className="w-[32px] h-[32px] text-[18px] text-[white] cursor-pointer flex flex-row items-center justify-center"
                >
                    <IoMdClose />
                </div>
            </div>
            <div className="w-full flex text-bl text-white flex-col ">
                <div
                    className={`overflow-y-auto px-2`}
                    style={{
                        maxHeight: window.innerHeight - 48 - 8 * 2,
                    }}
                    onScroll={onScrollPause}
                >
                    {sliced_log?.map((c, i) => (
                        <div
                            className="font-mono text-[13px] font-light"
                            dangerouslySetInnerHTML={{
                                __html: ansiConvertor.toHtml(c.message),
                            }}
                        />
                        // <div key={i} className={classifier(c[0].message)}>
                        //     <div>{c[0].timestamp.toISOString()}</div>
                        //     <div className="flex flex-col">
                        //         {c.map(({ message }) => (
                        // <div
                        //     dangerouslySetInnerHTML={{
                        //         __html: ansiConvertor.toHtml(
                        //             message
                        //         ),
                        //     }}
                        // />
                        //         ))}
                        //     </div>
                        //     <div />
                        // </div>
                    ))}
                    <div ref={scrollRef} style={{ height: 1 }} />
                </div>
            </div>
        </div>
    );
}

export default observer(LogPane);
