import { makeAutoObservable, observable } from "mobx";
import RootStore from "./root.store";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";

export default class LogsStore {
    rootStore: RootStore;

    logs: Map<string, ContainerLogs[]>;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.logs = new Map<string, ContainerLogs[]>();

        makeAutoObservable(this);

        listen("CONTAINERS", (data) => {
            let container_id: string;
            let message: string;

            const tmp = data.payload as {
                destination: string;
                payload: string;
            };

            container_id = tmp.destination;
            message = tmp.payload;

            if (!this.logs.has(container_id)) {
                this.logs.set(container_id, []);
            }

            const log: ContainerLogs = {
                timestamp: new Date(),
                message: message,
            };

            // we are sure the key exists because of the check above
            const logs_data = this.logs.get(container_id) as ContainerLogs[];

            // it triggers mobx observabilty + [...] syntax is very bad
            logs_data.push(log);
        });
    }

    get_logs(container_id: string): ContainerLogs[] | undefined {
        if (!this.logs.has(container_id)) {
            return this.logs.get(container_id);
        } else {
            console.error(`Container not found ${container_id}`);
            return [];
        }
    }

    async subscribe_to_container(container_id: string) {
        try {
            const container = this.rootStore.containerStore.containers.find(
                (c) => c.id == container_id
            );

            if (!container) {
                throw new Error("Cannot subscribe because container not found");
            }

            invoke("get_logs", {
                containerId: container_id,
                invokeId: Math.floor(Math.random() * 9999),
            });

            this.logs.set(container_id, []);
            container.logs_subscribed = true;
        } catch (e) {
            throw new Error("Subscribe failed : " + e);
        }
    }
}
