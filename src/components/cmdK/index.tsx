import { observer } from "mobx-react";
import useStores from "../../hooks/useStore";
import Search from "../icons/search";
import getIcon, { Icons } from "../icons/plexer";
import Docker from "../icons/docker";
import Split from "../icons/split";
import Filter from "../icons/filter";

const CommandK = () => {
    const { commandStore } = useStores();

    if (commandStore.is_open) {
        return (
            <div className="z-50 absolute backdrop-blur-sm w-screen h-screen flex justify-center items-center">
                <div
                    onClick={() => {}}
                    className="z-50 bg-[#1D1D1D] w-[500px] rounded-md border border-[#292929]"
                >
                    <div className="w-full border-b flex flex-row gap-3 items-center p-3 border-[#292929]">
                        <div className="w-[16px] h-[16px]">
                            <Search />
                        </div>
                        <input
                            autoFocus
                            className="w-full !outline-none bg-[#1D1D1D] text-white"
                            placeholder="Search..."
                            value={commandStore.search_input}
                            onChange={(e) =>
                                (commandStore.search_input = e.target.value)
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-3 py-2">
                        {commandStore.render_commands.map((command, index) => {
                            let is_selected =
                                index === commandStore.selected_command_index ||
                                command.is_selected;
                            if (command) {
                                return (
                                    <div
                                        className={`${
                                            is_selected
                                                ? "text-white bg-zinc-800"
                                                : "text-[#a09fa3]"
                                        } w-full flex flex-row items-center gap-3 h-[30px] px-3`}
                                    >
                                        <div className="w-[20px] h-[20px] fill-white">
                                            {command.icon == Icons.Docker && (
                                                <Docker />
                                            )}
                                            {command.icon == Icons.Split && (
                                                <Split />
                                            )}
                                            {command.icon == Icons.Filter && (
                                                <Filter />
                                            )}
                                        </div>
                                        {command.title}
                                        <div className="flex-grow"></div>
                                        {!is_selected ? (
                                            <div className="w-[24px] text-[12px] text-[#525252] h-[24px] border border-[#292929] rounded flex flex-row items-center justify-center">
                                                {command.command}
                                            </div>
                                        ) : (
                                            <div className="w-[24px] text-[12px] text-[white] h-[24px] rounded flex flex-row items-center justify-center">
                                                ➔
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
                <div
                    className="absolute w-screen z-40 h-screen bg-black opacity-70"
                    onClick={() => (commandStore.is_open = false)}
                ></div>
            </div>
        );
    }

    return null;
};

export default observer(CommandK);
