import Docker from "./docker";
import Search from "./search";

export enum Icons {
    Docker,
    Search,
    Split,
    Filter,
    Quit,
}

export default function getIcon(icon: Icons) {
    switch (icon) {
        case Icons.Docker:
            return <Docker />;
        case Icons.Search:
            return <Search />;
        default:
            return <Docker />;
    }
}
