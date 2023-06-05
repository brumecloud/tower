import { observer } from "mobx-react";
import LogsPane from "./panes/docker_logs.pane";
import PodsPane from "./panes/pod_logs.pane";
import useStores from "../hooks/useStore";
import CommandK from "../components/cmdK";
import SettingsPane from "./panes/settings.pane";

function HomePage() {
    const { tabStore } = useStores();

    const size = () => {
        return {
            width: `${Math.round((100 / tabStore.tabs.length) * 100) / 100}%`,
        };
    };

    return (
        <main className="h-screen w-screen overflow-hidden backdrop-blur-xl">
            <CommandK />
            <div className="absolute flex flex-row p-2 h-full w-full z-1 gap-2">
                {tabStore.tabs.length > 0 &&
                    tabStore.tabs.map((t, i) => (
                        <div key={i} style={size()}>
                            {t.type == "CONTAINER" && (
                                <LogsPane
                                    container_id={t.container.id}
                                    tab={t}
                                />
                            )}
                            {t.type == "PODS" && (
                                <PodsPane pod={t.pods} tab={t} />
                            )}
                            {t.type == "SETTINGS" && <SettingsPane tab={t} />}
                        </div>
                    ))}
            </div>
            <div className="w-screen h-screen absolute -z-50 bg-[#1a1a1a]"></div>
        </main>
    );
}

export default observer(HomePage);
