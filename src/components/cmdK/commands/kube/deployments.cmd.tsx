import { observer } from "mobx-react";
import useStores from "../../../../hooks/useStore";
import List from "../../List";
import ListItem from "../../ListItem";
import { FaDocker } from "react-icons/fa";

const DeploymentsList = (props: { search: string }) => {
    const { kubeStore } = useStores();

    return (
        <List heading="All deployments">
            {kubeStore.all_deployments
                .filter((c) => c.metadata?.name?.includes(props.search))
                .map((c, i) => (
                    <ListItem
                        key={i}
                        index={i}
                        icon={FaDocker}
                        typeString={`replicas: ${c.status?.readyReplicas}/${c.status?.replicas}`}
                        onClick={() => {
                            // tabStore.addPane({ container: c })
                        }}
                    >
                        {c.metadata?.name}
                    </ListItem>
                ))}
        </List>
    );
};

export default observer(DeploymentsList);
