import { observer } from "mobx-react";
import useStores from "../../hooks/useStore";
import Docker from "../../components/icons/docker";

function LogPane({ container_id, tab }: { container_id: string; tab: Tab }) {
    const { containerStore, logStore, tabStore } = useStores();
    const container = containerStore.all_containers.find(
        (c) => c.id === container_id
    ) as Container;

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

    const closePane = () => {
        tabStore.closePane(tab);
    };

    return (
        <div className="w-full h-full bg-[#1D1D1D] overflow-hidden pb-4 border border-[#292929] rounded">
            <div className="border-b w-full p-2 text-white flex border-[#292929] items-center gap-3 flex-row">
                <div className="w-[24px] h-[24px] fill-white">
                    <Docker />
                </div>
                {container.name} - {container.created_at.toISOString()}
                <div className="flex-grow"></div>
                <div
                    onClick={closePane}
                    className="w-[32px] h-[32px] text-[18px] text-[white] cursor-pointer flex flex-row items-center justify-center"
                >
                    ×
                </div>
            </div>
            <div className="w-full h-full flex text-bl text-white flex-col">
                <div className="overflow-scroll px-2">
                    {logs?.map((c) => (
                        <div className={classifier(c.message)}>{c.message}</div>
                    ))}
                    <div className="h-[30px] w-full"></div>
                </div>
            </div>
        </div>
    );
}

export default observer(LogPane);
