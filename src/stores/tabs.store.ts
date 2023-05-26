import { makeAutoObservable, observable } from "mobx";
import RootStore from "./root.store";

export default class TabStore {
    rootStore: RootStore;

    tabs: Tab[];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.tabs = [];

        makeAutoObservable(this);
    }

    closePane = (tab: Tab) => {
        this.tabs = this.tabs.filter((t) => t != tab);
    };

    addPane = (tab: Tab) => {
        this.tabs.push(tab);
    };
}