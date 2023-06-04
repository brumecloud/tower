import { Root } from "react-dom/client";
import RootStore from "./root.store";
import { invoke } from "@tauri-apps/api";
import { Pod } from "kubernetes-types/core/v1";
import { Deployment } from "kubernetes-types/apps/v1";
import { Service } from "kubernetes-types/core/v1";
import { listen } from "@tauri-apps/api/event";
import { makeAutoObservable } from "mobx";

export default class KubeStore {
    rootStore: RootStore;

    pods: Pod[] = [];
    deployments: Deployment[] = [];
    services: Service[] = [];

    logs: Map<string, PodsLogs[]>;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.logs = new Map<string, PodsLogs[]>();

        this.get_pods();
        this.get_deployments();
        this.get_services();

        makeAutoObservable(this);

        listen("PODS", (data) => {
            let pods_uid: string;
            let message: string;

            const tmp = data.payload as {
                destination: string;
                payload: string;
            };

            pods_uid = tmp.destination;
            message = tmp.payload;

            if (!this.logs.has(pods_uid)) {
                this.logs.set(pods_uid, []);
            }

            const log: PodsLogs = {
                timestamp: new Date(),
                message: message,
            };

            // we are sure the key exists because of the check above
            const logs_data = this.logs.get(pods_uid) as PodsLogs[];

            // it triggers mobx observabilty + [...] syntax is very bad
            logs_data.push(log);
        });
    }

    async get_pods() {
        const rawData = (await invoke("get_pods")) as string;
        this.pods = JSON.parse(rawData) as Pod[];
    }

    async get_deployments() {
        const rawData = (await invoke("get_deployments")) as string;
        this.deployments = JSON.parse(rawData) as Deployment[];
    }

    async get_services() {
        const rawData = (await invoke("get_services")) as string;
        this.services = JSON.parse(rawData) as Service[];
    }

    get_logs(pods_id: string): ContainerLogs[] | undefined {
        if (this.logs.has(pods_id)) {
            return this.logs.get(pods_id);
        } else {
            console.error(`Container not found ${pods_id}`);
            return [];
        }
    }

    async subscribe_to_pods_logs(pod: Pod) {
        try {
            console.log(pod);
            const pods = this.pods.find(
                (c) => c.metadata?.uid == pod.metadata?.uid
            );

            if (!pods) {
                throw new Error("Cannot subscribe because pod not found");
            }

            console.log("subcribing to pod", pods.metadata?.name);

            invoke("get_pods_logs", {
                podsId: pods.metadata?.name,
            });

            this.logs.set(pods.metadata?.uid as string, []);

            console.log(`subscribe to pods ${pod.metadata?.name}`);
        } catch (e) {
            throw new Error("Subscribe failed : " + e);
        }
    }

    get all_pods() {
        return this.pods;
    }

    get all_service() {
        return this.services;
    }

    get all_deployments() {
        return this.deployments;
    }

    get all_logs() {
        return this.logs;
    }
}