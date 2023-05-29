import { observer } from "mobx-react";
import useStores from "../../../hooks/useStore";
import List from "../List";
import ListItem from "../ListItem";
import { FaDocker } from "react-icons/fa";

const ContainerList = () => {
    const { containerStore, tabStore } = useStores();

    return (
        <List heading="All containers">
            {containerStore.all_containers.map((c, i) => (
                <ListItem
                    key={i}
                    index={i}
                    icon={FaDocker}
                    typeString={c.image}
                    onClick={() => tabStore.addPane({ container: c })}
                >
                    {c.name}
                </ListItem>
            ))}
        </List>
    );
};

export default observer(ContainerList);
