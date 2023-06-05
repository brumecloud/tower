import { observer } from "mobx-react";
import useStores from "../../../../hooks/useStore";
import List from "../../List";
import ListItem from "../../ListItem";
import { FaDocker } from "react-icons/fa";

const PodsList = () => {
    const { kubeStore, tabStore, commandStore, settingStore } = useStores();

    const ns = settingStore.kubernetes_scoped_namespace
        ? settingStore.kubernetes_scoped_namespace
        : settingStore.kubernetes_default_namespace;

    return (
        <List heading={`All pods (in ns ${ns})`}>
            {kubeStore.all_pods
                .filter((c) => c.metadata?.name?.includes(commandStore.search))
                .map((c, i) => (
                    <ListItem
                        key={i}
                        index={i}
                        icon={FaDocker}
                        typeString={c.spec?.containers[0]?.image}
                        onClick={() => {
                            tabStore.addPane({ type: "PODS", pods: c });
                        }}
                    >
                        {c.metadata?.name}
                    </ListItem>
                ))}
        </List>
    );
};

export default observer(PodsList);
