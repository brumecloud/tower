import { observer } from "mobx-react";
import useStores from "../../../../hooks/useStore";
import List from "../../List";
import ListItem from "../../ListItem";
import { FaDocker } from "react-icons/fa";

const ServiceList = (props: { search: string }) => {
    const { kubeStore } = useStores();

    return (
        <List heading="All services">
            {kubeStore.all_service
                .filter((c) => c.metadata?.name?.includes(props.search))
                .map((c, i) => (
                    <ListItem
                        key={i}
                        index={i}
                        icon={FaDocker}
                        typeString={""}
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

export default observer(ServiceList);
