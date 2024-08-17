export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        autoComplete,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        itemRef,
        ...rest
    } = props;
    return <input autoComplete="off" {...rest} />;
}

