import { observer } from "mobx-react";
import useStores from "../../../hooks/useStore";
import List from "../List";
import ListItem from "../ListItem";
import { FaDocker } from "react-icons/fa";
import { JsonStructure, JsonStructureItem, filterItems } from "react-cmdk";

const ContainerList = () => {
    const { containerStore, tabStore, commandStore } = useStores();

    return (
        <List heading="All containers">
            {containerStore.all_containers
                .filter((c) => c.name.includes(commandStore.search))
                .map((c, i) => (
                    <ListItem
                        key={i}
                        index={i}
                        icon={FaDocker}
                        typeString={c.image}
                        onClick={() =>
                            tabStore.addPane({
                                container: c,
                                type: "CONTAINER",
                            })
                        }
                    >
                        {c.name}
                    </ListItem>
                ))}
        </List>
    );
};

export default observer(ContainerList);
