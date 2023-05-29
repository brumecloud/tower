import { observer } from "mobx-react";
import LogsPane from "./panes/logs.pane";
import useStores from "../hooks/useStore";
import CommandK from "../components/cmdK";

function HomePage() {
    const { tabStore } = useStores();

    return (
        <main className="h-screen w-screen overflow-hidden backdrop-blur-xl">
            <CommandK />
            <div className="absolute flex flex-row p-2 h-full w-full z-1 gap-2">
                {tabStore.tabs.length > 0 &&
                    tabStore.tabs.map((t, i) => (
                        <div key={i} className={`w-full h-full`}>
                            <LogsPane container_id={t.container.id} tab={t} />
                        </div>
                    ))}
            </div>
            <div className="w-screen h-screen absolute -z-50 bg-[#1a1a1a]"></div>
        </main>
    );
}

export default observer(HomePage);
