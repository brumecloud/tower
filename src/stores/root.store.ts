import { configure } from "mobx";
import LogsStore from "./logs.store";
import ContainerStore from "./container.store";
import CommandStore from "./command.store";
import TabStore from "./tabs.store";

configure({
    enforceActions: "never",
});

export default class RootStore {
    logStore: LogsStore;
    containerStore: ContainerStore;
    commandStore: CommandStore;
    tabStore: TabStore;

    constructor() {
        this.logStore = new LogsStore(this);
        this.containerStore = new ContainerStore(this);
        this.commandStore = new CommandStore(this);
        this.tabStore = new TabStore(this);
    }
}
