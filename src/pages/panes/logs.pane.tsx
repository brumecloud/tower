import { observer } from "mobx-react";
import useStores from "../../hooks/useStore";
import { useEffect, useRef, useState } from "react";
import LogViewer from "../../components/logs/viewer";
import Docker from "../../components/icons/docker";
import { FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

function LogPane({ container_id, tab }: { container_id: string; tab: Tab }) {
    const { containerStore, logStore, tabStore } = useStores();
    const container = containerStore.all_containers.find(
        (c) => c.id === container_id
    ) as Container;

    const closePane = () => {
        tabStore.closePane(tab);
    };

    const widthCalculator = () => {
        if (tabStore.tabs.length === 1) {
            return `calc(100% - 16px)`;
        } else {
            return `calc(100% / ${tabStore.tabs.length} - 13px)`;
        }
    };

    const leftCalculator = () => {
        let data = `calc(100% * ${tabStore.tabs.length - 1} / ${
            tabStore.tabs.length
        } + 8px)`;

        console.log(data);

        return data;
    };

    return (
        <div className="w-full h-full bg-[#1D1D1D] overflow-hidden border border-[#292929] rounded">
            <div
                style={{
                    position: "absolute",
                    border: "1px solid #292929",
                    borderLeft: 0,
                    width: widthCalculator(),
                    top: "8px",
                    height: "48px",
                    display: "flex",
                    flex: 1,
                    padding: "8px",
                    paddingLeft: "16px",
                    flexDirection: "row",
                    gap: "8px",
                    background: "#1D1D1D",
                    color: "white",
                    alignItems: "center",
                }}
            >
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
            <div className="h-full w-full overflow-hidden">
                <LogViewer container_id={container_id} />
            </div>
        </div>
    );
}

export default observer(LogPane);
