import { configure } from "mobx";
import LogsStore from "./logs.store";
import ContainerStore from "./container.store";
import CommandStore from "./command.store";
import TabStore from "./tabs.store";
import KubeStore from "./kubernetes.store";
import SettingStore from "./settings.store";

configure({
    enforceActions: "never",
});

export default class RootStore {
    logStore: LogsStore;
    containerStore: ContainerStore;
    commandStore: CommandStore;
    tabStore: TabStore;
    kubeStore: KubeStore;
    settingStore: SettingStore;

    constructor() {
        this.settingStore = new SettingStore(this);

        this.logStore = new LogsStore(this);
        this.containerStore = new ContainerStore(this);
        this.commandStore = new CommandStore(this);
        this.tabStore = new TabStore(this);
        this.kubeStore = new KubeStore(this);
    }
}
