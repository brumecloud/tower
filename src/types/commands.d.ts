type Commands = {
    type: string;
    icon: Icons;
    title: string;
    command: string;
    is_selected: boolean;
    trigger?: () => void;
    sub_commands?: Commands[];
};
