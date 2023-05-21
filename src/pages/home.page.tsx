import { observer } from "mobx-react";
import LogsPane from "./panes/logs.pane";
import Example from "../components/cmdK";
import useStores from "../hooks/useStore";

function HomePage() {
    const { tabStore } = useStores();

    console.log("tabs", JSON.stringify(tabStore.tabs, null, 2));

    return (
        <main className="h-screen w-screen overflow-hidden backdrop-blur-xl">
            <Example />
            <div className="absolute flex flex-row p-2 h-full w-full z-1">
                {tabStore.tabs.length == 2 && (
                    <>
                        <div className="pr-1 w-1/2 h-full">
                            <LogsPane
                                container_id={tabStore.tabs[0].container.id}
                            />
                        </div>
                        <div className="pl-1 w-1/2 h-full">
                            <LogsPane
                                container_id={tabStore.tabs[1].container.id}
                            />
                        </div>
                    </>
                )}
                {tabStore.tabs.length === 1 && (
                    <LogsPane container_id={tabStore.tabs[0].container.id} />
                )}
            </div>
            <div className="w-screen h-screen absolute -z-50 bg-[#1D1D1D]"></div>
        </main>
    );
}

export default observer(HomePage);
