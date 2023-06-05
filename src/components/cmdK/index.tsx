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
import { ImExit, ImWrench } from "react-icons/im";
import { BiWindowClose, BiWindow } from "react-icons/bi";
import { SiKubernetes } from "react-icons/si";

import useStores from "../../hooks/useStore";
import { observer } from "mobx-react";
import ContainerList from "./commands/container.cmd";
import PodsList from "./commands/kube/pods.cmd";
import DeploymentList from "./commands/kube/deployments.cmd";
import ServiceList from "./commands/kube/service.cmd";
import { Tab } from "../../types/tabs";
import NamespaceList from "./commands/kube/namespace.cmd";

const CommandK = () => {
    const { containerStore, tabStore, settingStore, commandStore } =
        useStores();

    useHandleOpenCommandPalette(() => {
        commandStore.is_open = true;
    });

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
                        commandStore.command_page = "container_list";
                        commandStore.search = "";
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
                        if (
                            settingStore.kubernetes_customize_namespace_at_command
                        ) {
                            commandStore.command_page = "namespace_list";
                            commandStore.tmp_next_command_page = "pods_list";
                        } else {
                            commandStore.command_page = "pods_list";
                        }
                        commandStore.search = "";
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
                        if (
                            settingStore.kubernetes_customize_namespace_at_command
                        ) {
                            commandStore.command_page = "namespace_list";
                            commandStore.tmp_next_command_page =
                                "services_list";
                        } else {
                            commandStore.command_page = "services_list";
                        }
                        commandStore.search = "";
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
                        if (
                            settingStore.kubernetes_customize_namespace_at_command
                        ) {
                            commandStore.command_page = "namespace_list";
                            commandStore.tmp_next_command_page =
                                "deployments_list";
                        } else {
                            commandStore.command_page = "deployments_list";
                        }
                        commandStore.search = "";
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
                        commandStore.command_page = "container_list";
                        commandStore.search = "";
                    },
                },
                {
                    children: "Close a tab",
                    icon: BiWindowClose,
                    id: "close_tab_action",
                    href: "#",
                    closeOnSelect: false,
                    onClick: () => {
                        commandStore.command_page = "close_tab";
                        commandStore.search;
                    },
                },
            ],
        },
        {
            heading: "Settings",
            id: "settings",
            items: [
                {
                    children: "Settings",
                    icon: ImWrench,
                    id: "wrench",
                    href: "#",
                    typeString: "Change parameters",
                    onClick: () => {
                        tabStore.addPane({ type: "SETTINGS" });
                        commandStore.reset();
                    },
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
        {
            heading: "Credit",
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
            ],
        },
    ];

    const rootItems = filterItems(items, commandStore.search);

    return (
        <CommandPalette
            onChangeSelected={(v) => (commandStore.item_selected = v)}
            onChangeSearch={(s) => (commandStore.search = s)}
            onChangeOpen={(o) => (commandStore.is_open = o)}
            selected={commandStore.item_selected}
            search={commandStore.search}
            isOpen={commandStore.is_open || tabStore.tabs.length == 0}
            page={commandStore.command_page}
        >
            <Page id="root" searchPrefix={["Tower"]}>
                {rootItems.length ? (
                    renderJsonStructure(rootItems)
                ) : (
                    <ContainerList />
                )}
            </Page>

            <Page
                searchPrefix={["Tower", "Containers"]}
                id="container_list"
                onEscape={() => {
                    commandStore.command_page = "root";
                }}
            >
                <ContainerList />
            </Page>

            <Page
                searchPrefix={["Tower", "Pods"]}
                id="pods_list"
                onEscape={() => {
                    commandStore.command_page = "root";
                }}
            >
                <PodsList />
            </Page>

            <Page
                searchPrefix={["Tower", "Deployments"]}
                id="deployments_list"
                onEscape={() => {
                    commandStore.command_page = "root";
                }}
            >
                <DeploymentList />
            </Page>

            <Page
                searchPrefix={["Tower", "Namespaces"]}
                id="namespace_list"
                onEscape={() => {
                    commandStore.command_page = "root";
                }}
            >
                <NamespaceList />
            </Page>

            <Page
                searchPrefix={["Tower", "Services"]}
                id="services_list"
                onEscape={() => {
                    commandStore.command_page = "root";
                }}
            >
                <ServiceList />
            </Page>

            <Page
                searchPrefix={["Tower", "Close a tab"]}
                id="close_tab"
                onEscape={() => {
                    commandStore.command_page = "root";
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
                                commandStore.reset();
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
