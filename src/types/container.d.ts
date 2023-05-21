type Container = {
    id: string;
    image: string;
    name: string;
    created_at: Date;
    logs_subscribed: boolean;
};

type ExportedContainer = {
    Created: string;
    Command: string;
    Id: string;
    Image: string;
    ImageID: string;
    Labels: { [string]: string };
    Names: string[];
    Ports: {
        ip: string;
        PrivatePort: number;
        PublicPort: number;
        Type: string;
    }[];
    State: string;
    Status: string;
    SizeRw: string;
    SizeRootFs: string;
};
