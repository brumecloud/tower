import { observer } from "mobx-react";
import useStores from "../../hooks/useStore";
import { useEffect, useRef, useState } from "react";
import Pods from "../../components/icons/pod";
import { FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import AnsiConvertor from "ansi-to-html";
import { Tab } from "../../types/tabs";
import { Pod } from "kubernetes-types/core/v1";
import Docker from "../../components/icons/docker";
import { SiKubernetes } from "react-icons/si";

const MAX_LOGS = 300;

function PodLogsPane({ pod, tab }: { pod: Pod; tab: Tab }) {
    const ansiConvertor = new AnsiConvertor({
        escapeXML: false,
        fg: "var(--text-color)",
    });

    const { kubeStore, tabStore } = useStores();
    const scrollRef = useRef<HTMLInputElement>(null);
    const [scrollToBottom, setScrollToBottom] = useState(true);
    const [renderable_logs, setRenderableLogs] = useState<ContainerLogs[]>([]);
    const [lastLogsIndex, setLastLogsIndex] = useState(0);

    let logs = kubeStore.logs.get(pod.metadata?.uid as string) as PodsLogs[];

    const [autoScroll, setAutoScroll] = useState(false);

    const closePane = () => {
        tabStore.closePane(tab);
    };

    useEffect(() => {
        if (scrollToBottom) {
            setRenderableLogs(
                logs?.slice(logs.length - MAX_LOGS, logs.length) as []
            );
            //@ts-ignore
            scrollRef.current.scrollIntoView({
                block: "start",
            });
            setAutoScroll(true);
        } else {
            setRenderableLogs((l) => {
                let ll = [...l];
                ll.concat(logs?.slice(lastLogsIndex, logs.length));
                return ll;
            });
        }
        setLastLogsIndex(logs?.length as number);
    }, [logs?.length]);

    const onScrollPause = (e: any) => {
        if (autoScroll) {
            setAutoScroll(false);
            return;
        }
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
                    <SiKubernetes size={23} />
                </div>
                {pod.metadata?.name} -{" "}
                {new Date(
                    pod.metadata?.creationTimestamp as string
                ).toISOString()}
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
                    {renderable_logs.map((c, i) => (
                        <div
                            className="font-mono text-[13px] font-light"
                            dangerouslySetInnerHTML={{
                                __html: ansiConvertor.toHtml(c.message),
                            }}
                        />
                    ))}
                    <div ref={scrollRef} style={{ height: 1 }} />
                </div>
            </div>
        </div>
    );
}

export default observer(PodLogsPane);
