import { observer } from "mobx-react";
import useStores from "../../../hooks/useStore";
import List from "../List";
import ListItem from "../ListItem";
import { FaDocker } from "react-icons/fa";
import { JsonStructure, JsonStructureItem, filterItems } from "react-cmdk";

const ContainerList = (props: { search: string }) => {
    const { containerStore, tabStore } = useStores();

    const containerList: JsonStructureItem[] =
        containerStore.all_containers.map((c, i) => ({
            id: i.toString(),
            typeString: c.image,
            icon: FaDocker,
            renderLink: (props) => <a {...props} />,
            onClick: () => tabStore.addPane({ container: c }),
        }));

    return (
        <List heading="All containers">
            {containerStore.all_containers
                .filter((c) => c.name.includes(props.search))
                .map((c, i) => (
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
