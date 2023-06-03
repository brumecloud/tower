import { makeAutoObservable, observable } from "mobx";
import RootStore from "./root.store";
import { invoke } from "@tauri-apps/api";

export default class TabStore {
    rootStore: RootStore;

    tabs: Tab[];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.tabs = [];

        makeAutoObservable(this);
    }

    closePane = async (tab: Tab) => {
        this.tabs = this.tabs.filter((t) => t != tab);
        if (tab.container) {
            await invoke("stop_get_logs", {
                containerId: tab.container.id,
            });
            console.info("stopped container", { container: tab.container });
        }
    };

    addPane = (tab: Tab) => {
        this.rootStore.logStore.subscribe_to_container(tab.container.id);
        this.tabs.push(tab);
    };
}
