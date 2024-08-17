class SpinnerContext {
    private theCounter: (React.Dispatch<React.SetStateAction<number>>) = (n) => n;

    public setCounter(counter: React.Dispatch<React.SetStateAction<number>>) {
        this.theCounter = counter;
    }

    public async runWhileShowingSpinner<T>(action: () => Promise<T | undefined>): Promise<T | undefined> {
        try {
            this.theCounter(x => ++x);

            return await action();
        } finally {
            this.theCounter(x => --x);
        }
    }
}

const spinnerContext = new SpinnerContext();

export {
    spinnerContext,
};

