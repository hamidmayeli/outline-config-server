import Logo from "assets/logo";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "./appContext";

export default function Header({
  isDark,
  themeChanged,
}: {
  isDark: boolean,
  themeChanged: (isDark: boolean) => void,
}) {
  const { currentUser, logout } = useContext(AppContext);

  const toggle = (reverseCondition?: boolean) => {
    if (!reverseCondition) {
      themeChanged(!isDark);
    }
  };

  return (
    <header className="border-b-gray-500 bg-sky-100 dark:bg-gray-900 text-gray-800
      dark:text-slate-200 h-14 px-1 md:px-2 shadow dark:shadow-slate-800 z-50 relative">
      <nav className="flex max-w-5xl mx-auto h-full justify-center items-center">
        <div className="flex justify-center items-center shrink-0">
          <Link to="/" ><Logo className="w-8" /></Link>
          <Link to="/report" className="px-3">Report</Link>
        </div>

        <div className="p-2 w-full">
        </div>

        <div className="px-2 flex items-center h-full shrink-0 gap-2">
          {currentUser ? (<button onClick={() => logout()}>Logout</button>) : null}
          <svg id="theme-toggle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            onClick={() => toggle()}
            className="w-8 h-8 stroke-sky-900 dark:stroke-orange-500 cursor-pointer"
            onKeyDown={(event) => toggle(event.key !== "Enter")}
            tabIndex={0}
          >
            <g>
              <path id="Vector" d="M12 4V2M12 20V22M6.41421 6.41421L5 5M17.728 17.728L19.1422 19.1422M4 12H2M20 12H22M17.7285 6.41421L19.1427 5M6.4147 17.728L5.00049 19.1422M12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </nav>
    </header>
  );
}

