import { makeAutoObservable, observable } from "mobx";
import RootStore from "./root.store";
import { invoke } from "@tauri-apps/api";

export default class ContainerStore {
    rootStore: RootStore;

    containers: Container[];
    containers_loading: boolean = true;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        this.containers = [];

        this.get_all_containers();

        makeAutoObservable(this);
    }

    async get_all_containers() {
        const tmp = JSON.parse(
            await invoke("get_containers")
        ) as ExportedContainer[];

        tmp.map((tmpContainer) => {
            const c: Container = {
                created_at: new Date(tmpContainer["Created"]),
                image: tmpContainer.Image,
                name: tmpContainer.Names[0],
                id: tmpContainer.Id,
                logs_subscribed: false,
            };
            this.containers.push(c);
        });

        this.containers_loading = false;
    }

    get all_containers() {
        return this.containers;
    }
}
