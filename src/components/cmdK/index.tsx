import { useEffect, useState } from "react";
import CommandPalette from "./CommandPalette";
import List from "./List";
import ListItem from "./ListItem";
import Page from "./Page";
import {
    filterItems,
    renderJsonStructure,
    useHandleOpenCommandPalette,
} from "./lib/utils";
import { JsonStructure } from "./types";
import { exit } from "@tauri-apps/api/process";

import { FaDocker, FaGithub } from "react-icons/fa";
import { RiPagesFill } from "react-icons/ri";
import { BsWindowSplit } from "react-icons/bs";
import { ImExit } from "react-icons/im";
import { BiWindowClose, BiWindow } from "react-icons/bi";
import { SiKubernetes } from "react-icons/si";

import useStores from "../../hooks/useStore";
import { observer } from "mobx-react";
import ContainerList from "./commands/container.cmd";
import PodsList from "./commands/kube/pods.cmd";
import DeploymentList from "./commands/kube/deployments.cmd";
import ServiceList from "./commands/kube/service.cmd";
import { Tab } from "../../types/tabs";

const CommandK = () => {
    const { containerStore, tabStore } = useStores();
    const [selected, setSelected] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<
        | "root"
        | "container_list"
        | "close_tab"
        | "pods_list"
        | "deployments_list"
        | "services_list"
    >("root");

    useHandleOpenCommandPalette(setIsOpen);

    useEffect(() => {
        if (isOpen == false) {
            reset();
        }
    }, [isOpen]);

    const reset = () => {
        setPage("root");
        setSearch("");
    };

    const items: JsonStructure = [
        {
            heading: "Docker",
            id: "logs",
            items: [
                {
                    children: "Containers",
                    icon: FaDocker,
                    id: "list_container",
                    href: "#",
                    closeOnSelect: false,
                    renderLink: (props) => <a {...props} />,
                    typeString: "List all containers logs",
                    onClick: () => {
                        setPage("container_list");
                        setSearch("");
                    },
                },
            ],
        },
        {
            heading: "Kubernetes",
            id: "logs",
            items: [
                {
                    children: "Pods",
                    icon: SiKubernetes,
                    id: "list_pods",
                    href: "#",
                    closeOnSelect: false,
                    renderLink: (props) => <a {...props} />,
                    typeString: "Get all pods",
                    onClick: async () => {
                        setPage("pods_list");
                        setSearch("");
                    },
                },
                {
                    children: "Services",
                    icon: SiKubernetes,
                    id: "list_services",
                    href: "#",
                    closeOnSelect: false,
                    renderLink: (props) => <a {...props} />,
                    typeString: "Get all services",
                    onClick: async () => {
                        setPage("services_list");
                        setSearch("");
                    },
                },
                {
                    children: "Deployments",
                    icon: SiKubernetes,
                    id: "list_deployments",
                    href: "#",
                    closeOnSelect: false,
                    renderLink: (props) => <a {...props} />,
                    typeString: "Get all deployments",
                    onClick: async () => {
                        setPage("deployments_list");
                        setSearch("");
                    },
                },
            ],
        },
        {
            heading: "Tabs",
            id: "tabs",
            items: [
                {
                    children: "Split view",
                    icon: BsWindowSplit,
                    id: "split",
                    href: "#",
                    closeOnSelect: false,
                    onClick: () => {
                        setPage("container_list");
                        setSearch("");
                    },
                },
                {
                    children: "Close a tab",
                    icon: BiWindowClose,
                    id: "close_tab_action",
                    href: "#",
                    closeOnSelect: false,
                    onClick: () => {
                        setPage("close_tab");
                        setSearch("");
                    },
                },
            ],
        },
        {
            heading: "Credit & Exit",
            id: "credits",
            items: [
                {
                    href: "https://tower.brume.dev/",
                    children: "Website",
                    icon: RiPagesFill,
                    id: "website",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    typeString: "Go to Tower website",
                },
                {
                    href: "https://github.com/brumecloud/tower",
                    children: "Github",
                    icon: FaGithub,
                    id: "github",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    typeString: "Go to tower Github",
                },
                {
                    children: "Exit",
                    icon: ImExit,
                    id: "exit",
                    href: "#",
                    typeString: "Why would you exit Tower??",
                    onClick: () => {
                        exit(1);
                    },
                },
            ],
        },
    ];

    const rootItems = filterItems(items, search);

    return (
        <CommandPalette
            onChangeSelected={setSelected}
            onChangeSearch={setSearch}
            onChangeOpen={setIsOpen}
            selected={selected}
            search={search}
            isOpen={isOpen || tabStore.tabs.length == 0}
            page={page}
        >
            <Page id="root" searchPrefix={["Tower"]}>
                {rootItems.length ? (
                    renderJsonStructure(rootItems)
                ) : (
                    <ContainerList search={search} />
                )}
            </Page>

            <Page
                searchPrefix={["Tower", "Containers"]}
                id="container_list"
                onEscape={() => {
                    setPage("root");
                }}
            >
                <ContainerList search={search} />
            </Page>

            <Page
                searchPrefix={["Tower", "Pods"]}
                id="pods_list"
                onEscape={() => {
                    setPage("root");
                }}
            >
                <PodsList search={search} />
            </Page>

            <Page
                searchPrefix={["Tower", "Deployments"]}
                id="deployments_list"
                onEscape={() => {
                    setPage("root");
                }}
            >
                <DeploymentList search={search} />
            </Page>

            <Page
                searchPrefix={["Tower", "Services"]}
                id="services_list"
                onEscape={() => {
                    setPage("root");
                }}
            >
                <ServiceList search={search} />
            </Page>

            <Page
                searchPrefix={["Tower", "Close a tab"]}
                id="close_tab"
                onEscape={() => {
                    setPage("root");
                }}
            >
                <List heading="All opened tabs">
                    {tabStore.tabs.map((t, index) => (
                        <ListItem
                            key={index}
                            index={index}
                            icon={BiWindow}
                            onClick={() => {
                                const tabToRemove = tabStore.tabs.find(
                                    (_, id) => id == index
                                ) as Tab;
                                tabStore.closePane(tabToRemove);
                                reset();
                            }}
                        >
                            {t.type == "CONTAINER" && t.container.name}
                            {t.type == "PODS" && t.pods.metadata?.name}
                        </ListItem>
                    ))}
                </List>
            </Page>
        </CommandPalette>
    );
};

export default observer(CommandK);
