import { observer } from "mobx-react";
import useStores from "../../../../hooks/useStore";
import List from "../../List";
import ListItem from "../../ListItem";
import { FaDocker } from "react-icons/fa";

const NamespaceList = () => {
    const { kubeStore, settingStore, commandStore } = useStores();

    return (
        <List heading="All namespaces">
            {kubeStore.namespaces
                .filter((ns) => ns.includes(commandStore.search))
                .map((ns, i) => (
                    <ListItem
                        key={i}
                        index={i}
                        icon={FaDocker}
                        closeOnSelect={false}
                        onClick={async () => {
                            settingStore.kubernetes_scoped_namespace =
                                ns as string;
                            await kubeStore.reset_data();
                            commandStore.command_page =
                                commandStore.tmp_next_command_page;
                        }}
                    >
                        {ns}
                    </ListItem>
                ))}
        </List>
    );
};

export default observer(NamespaceList);
