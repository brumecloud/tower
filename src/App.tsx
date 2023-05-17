import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { InvokeArgs, invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type Container = {
    Id: string;
    Name: string;
    Image: string;
};

function App() {
    const [greetMsg, setGreetMsg] = useState("test");
    const [containers, setContainers] = useState<Container[]>([]);
    const [name, setName] = useState("");

    const ping = async () => {
        setGreetMsg(await invoke("test", { name: name }));
    };

    const get_containers = async () => {
        setContainers(JSON.parse(await invoke("get_containers")));
    };

    const get_logs = (id: string) => {
        console.log("getting logs for", id);
        invoke("get_logs", { id: id });
    };

    const greet = async () => {
        setGreetMsg(await invoke("greet"));
    };

    const js2rs = () => invoke("js2rs", { message: name });

    useEffect(() => {
        listen("rs2js", (data) => {
            console.log(data);
            //@ts-ignore
            setGreetMsg(data.payload);
        });
    }, []);

    return (
        <div className="container">
            <h1>Brume Tower</h1>

            <p>Containers:</p>
            <div className="row">
                <button type="submit" onClick={get_containers}>
                    Get containers
                </button>
            </div>
            <p>
                {containers.map((c) => {
                    return (
                        <button key={c.Id} onClick={() => get_logs(c.Id)}>
                            Container {c.Image}
                        </button>
                    );
                })}
            </p>
        </div>
    );
}

export default App;
