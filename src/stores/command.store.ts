import { makeAutoObservable, observable } from "mobx";
import RootStore from "./root.store";
import { Icons } from "../components/icons/plexer";

export default class CommandStore {
    rootStore: RootStore;

    is_open: boolean;
    search_input: string = "";
    element_selected: Commands | undefined;
    possible_element_selected: Commands | undefined;
    sub_view: boolean = false;
    selected_command_index = -1;

    top_level_commands: Commands[] = [
        {
            type: "list_container",
            icon: Icons.Docker,
            title: "Containers",
            command: "C",
            is_selected: false,
        },
        {
            type: "split",
            icon: Icons.Split,
            title: "Split the window",
            command: "SP",
            is_selected: false,
        },
        {
            type: "global_filters",
            icon: Icons.Filter,
            title: "General Filter",
            command: "F",
            is_selected: false,
        },
        {
            type: "exit",
            icon: Icons.Quit,
            title: "Quit Tower",
            command: "q",
            is_selected: false,
        },
    ];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        this.is_open = true;

        this.cmk_k_event_listener();

        makeAutoObservable(this);
    }

    cmk_k_event_listener() {
        console.debug("[cmdk] listener armed");
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key == "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                e.stopPropagation();

                console.debug("[cmdk] triggered");

                this.is_open = true;
            }

            if (this.is_open) {
                if (
                    e.key === "Escape" &&
                    this.rootStore.tabStore.tabs.length > 0
                ) {
                    this.is_open = false;
                    this.reset();
                }

                if (e.key === "Enter" && this.possible_element_selected) {
                    this.element_selected = this.possible_element_selected;
                    this.element_selected.trigger?.();
                    this.sub_view = true;
                    this.search_input = "";
                }

                if (e.key === "Backspace" && this.search_input == "") {
                    this.reset();
                }

                if (e.key === "ArrowDown") {
                    this.selected_command_index++;
                    this.possible_element_selected =
                        this.candidate[this.selected_command_index];
                }

                if (e.key === "ArrowUp") {
                    this.selected_command_index--;
                }
            }
        });
    }

    reset() {
        this.element_selected = undefined;
        this.search_input = "";
        this.selected_command_index = -1;
    }

    get candidate() {
        const before_render = this.render_selected_commands();

        if (before_render.length > 0) {
            return before_render;
        }

        const search = this.search_input
            .toLocaleLowerCase()
            .replaceAll(" ", "");

        const result = this.top_level_commands.filter(
            (cmd) => cmd.title.includes(search) || cmd.type.includes(search)
        );

        return result;
    }

    render_selected_commands(): Commands[] {
        if (
            (this.element_selected &&
                this.element_selected.type === "list_container") ||
            (this.element_selected &&
                this.element_selected.type === "split" &&
                this.rootStore.tabStore.tabs.length == 1)
        ) {
            return this.rootStore.containerStore.all_containers.map((c, i) => ({
                type: "container",
                icon: Icons.Docker,
                title: c.name,
                command: i.toString(),
                is_selected: false,
                trigger: async () => {
                    // subscribe to logs
                    await this.rootStore.logStore.subscribe_to_container(c.id);

                    const new_tab: LogsTab = {
                        container: c,
                    };

                    // add the tab to the render
                    this.rootStore.tabStore.tabs.push(new_tab);

                    console.log("container added");

                    this.rootStore.commandStore.is_open = false;
                },
            }));
        }

        return [];
    }

    get render_commands() {
        const result = this.candidate;

        if (result.length === 1) {
            result[0].is_selected = true;
            this.possible_element_selected = result[0];
        } else {
            result.forEach((c) => (c.is_selected = false));
        }

        return result;
    }
}
