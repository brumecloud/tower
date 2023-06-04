import { observer } from "mobx-react";
import useStores from "../../../../hooks/useStore";
import List from "../../List";
import ListItem from "../../ListItem";
import { FaDocker } from "react-icons/fa";

const PodsList = (props: { search: string }) => {
    const { kubeStore, tabStore } = useStores();

    return (
        <List heading="All pods">
            {kubeStore.all_pods
                .filter((c) => c.metadata?.name?.includes(props.search))
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
