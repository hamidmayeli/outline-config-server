import { spinnerContext } from "./context";
import Spinner from "./ui";

const runWhileShowingSpinner = spinnerContext.runWhileShowingSpinner.bind(spinnerContext);

export {
    Spinner,
    runWhileShowingSpinner,
};

