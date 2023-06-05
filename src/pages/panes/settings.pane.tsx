import { observer } from "mobx-react";
import useStores from "../../hooks/useStore";
import { ImWrench } from "react-icons/im";
import { Tab } from "../../types/tabs";
import { IoMdClose } from "react-icons/io";
import { SiKubernetes } from "react-icons/si";

function SettingsPane({ tab }: { tab: Tab }) {
    const { settingStore, kubeStore, tabStore } = useStores();

    const closePane = () => {
        tabStore.closePane(tab);
    };

    return (
        <div className="w-full h-full bg-[#1D1D1D] border border-[#292929] overflow-hidden rounded">
            <div className="w-full h-[48px] flex flex-row items-center text-white p-2 gap-2 border-b border-[#292929] px-3">
                <div className="w-[24px] h-[24px] fill-white">
                    <ImWrench />
                </div>
                Settings
                <div className="flex-grow"></div>
                <div
                    onClick={closePane}
                    className="w-[32px] h-[32px] text-[18px] text-[white] cursor-pointer flex flex-row items-center justify-center"
                >
                    <IoMdClose />
                </div>
            </div>
            <div className="flex flex-col pt-3 items-center px-2">
                <div className="w-full flex text-bl text-white flex-col max-w-[700px]">
                    <div className="flex flex-row justify-start gap-1 items-center pb-2">
                        <SiKubernetes size={24} />
                        <h3 className="text-md font-mono p-2">Kubernetes</h3>
                    </div>
                    <hr />
                    <div className="flex flex-row justify-between pt-[15px]">
                        <p>Default namespace</p>
                        <select
                            className="bg-[#1D1D1D]"
                            value={settingStore.kubernetes_default_namespace}
                            onChange={(e) =>
                                (settingStore.kubernetes_default_namespace =
                                    e.target.value)
                            }
                        >
                            {kubeStore.namespaces.map((n) => (
                                <option>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-row justify-between pt-2">
                        <p>Select namespace on new tab</p>
                        <input
                            type="checkbox"
                            className="bg-[#1D1D1D] text-right"
                            checked={
                                settingStore.kubernetes_customize_namespace_at_command
                            }
                            onChange={(e) =>
                                (settingStore.kubernetes_customize_namespace_at_command =
                                    e.target.checked)
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default observer(SettingsPane);
