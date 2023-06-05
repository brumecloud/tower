import { makeAutoObservable, observe } from "mobx";
import RootStore from "./root.store";

export default class SettingStore {
    rootStore: RootStore;

    kubernetes_default_namespace: string = "default";
    kubernetes_customize_namespace_at_command: boolean = false;
    kubernetes_scoped_namespace: string = "default";

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        makeAutoObservable(this);

        observe(this, (change) => {
            this.rootStore.kubeStore.reset_data();
        });
    }
}
