import { Pod } from "kubernetes-types/core/v1";

enum TabType {
    LOGS,
}

type LogsTab = {
    container: Container;
    type: "CONTAINER";
};

type PodsTab = {
    pods: Pod;
    type: "PODS";
};

type SettingTab = {
    type: "SETTINGS";
};

type Tab = LogsTab | PodsTab | SettingTab;
