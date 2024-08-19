import { useState, useContext, startTransition } from "react";
import { AlertContext } from "./alertContext";

export default function Alert() {
    const [hiddenKeys, setHiddenKeys] = useState([] as number[]);
    const { messages, remove } = useContext(AlertContext);

    const hide = (key: number) => {
        setHiddenKeys([...hiddenKeys, key]);
        setTimeout(() => {
            startTransition(() => {
                setHiddenKeys(hiddenKeys.filter(x => x !== key));
                remove(key);
            });
        }, 150);
    };
    
    return (
        <>
            <div className={"fixed flex flex-col bottom-5 left-5 gap-2 w-56 z-50"}>
                {messages.map(({ text, key }) => (
                    <div
                        key={key}
                        className={
                            "bg-rose-500 text-white p-2 inline-block rounded-md transition-all duration-150 ease-in" +
                            (hiddenKeys.indexOf(key) >= 0 ? " scale-0" : "")
                        }
                    >
                        <p>{text}</p>
                        <div className="grid">
                            <button
                                type="button"
                                onClick={() => hide(key)}
                                className="justify-self-end font-bold pl-2 px-2"
                            >Confirm
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
