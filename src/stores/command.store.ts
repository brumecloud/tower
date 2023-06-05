import { makeAutoObservable, observable, observe } from "mobx";
import RootStore from "./root.store";
import { Icons } from "../components/icons/plexer";

type PageList =
    | "root"
    | "container_list"
    | "close_tab"
    | "pods_list"
    | "deployments_list"
    | "services_list"
    | "namespace_list";

export default class CommandStore {
    rootStore: RootStore;

    command_page: PageList = "root";

    search = "";
    item_selected = 0;
    is_open = true;

    tmp_next_command_page: PageList = "root";

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        makeAutoObservable(this);

        observe(this, (change) => {
            if (change.name == "is_open" && change.object == false) {
                this.reset();
            }
        });
    }

    reset() {
        this.search = "";
        this.command_page = "root";
    }
}
