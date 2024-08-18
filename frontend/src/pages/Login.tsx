// src/LoginPage.js
import { loginApi } from 'apis/user';
import { AppContext } from 'components/appContext';
import { TextInput } from 'components/textInput';
import { startTransition, useContext, useState } from 'react';
import { forceEnglishDigits } from 'tools/misc';

export default function LoginPage() {
    const { login } = useContext(AppContext);

    const [formData, setFormData] = useState<{ username?: string, password?: string }>({});

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { name: theName, value: newValue } = evt.target;

        // save field values
        setFormData({
            ...formData,
            [theName]: forceEnglishDigits(newValue),
        });
    };
    
    const doLogin = async () => {
        if (formData.username &&
            formData.password) {
            const user = await loginApi(formData.username, formData.password);

            if (user) {
                startTransition(() => {
                    login(user);
                });
            }
            else {
                alert("No way!");
            }
        }
    }

    return (
        <section className="flex h-full">
            <div className="mx-auto p-10 flex flex-col grow-0 max-w-md">
                <h1 className="font-extrabold text-3xl text-center pb-7">Login</h1>
                
                <label htmlFor="username" className="pb-2">Username</label>
                <TextInput
                    id="username"
                    name="username"
                    type="text"
                    onChange={handleChange}
                    required />

                <label htmlFor="password" className="mt-5 pb-2">Password</label>
                <TextInput
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                    required
                />

                <button type="button" className="my-3 btn" onClick={doLogin}>
                    Login
                </button>
            </div>
        </section>
    );
}
