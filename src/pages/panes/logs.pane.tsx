import { observer } from "mobx-react";
import useStores from "../../hooks/useStore";

function LogPane({ container_id }: { container_id: string }) {
    const { logStore } = useStores();

    let logs = logStore.logs.get(container_id);

    console.log("logs", JSON.stringify(logs));

    return (
        <div className="w-full h-full bg-[#1D1D1D] rounded">
            <div className="w-full h-full flex text-white flex-col">
                <div className="overflow-scroll">
                    {logs?.map((c) => (
                        <div>{c.message}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default observer(LogPane);
