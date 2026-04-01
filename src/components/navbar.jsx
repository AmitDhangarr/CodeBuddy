'use client';
import { Instrument_Serif } from "next/font/google";
import { Moon, MoveRight, Sun } from 'lucide-react';
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import Link from "next/link";
const instrumentserif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400'
});
function Navbar() {
  const { setTheme ,resolvedTheme} = useTheme();

  const HandleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }
  return (
    <div className="navbar py-3 px-10  border-b-1">
      <nav className="flex justify-between items-center">
        <div className="logo flex items-center">
          <div className="icon bg-violet-500 flex justify-center items-center p-1.5 rounded-lg shadow-md  shadow-violet-400">⚡</div>
          <p className={`ml-3 ${instrumentserif.className} text-xl`}>SkillMatch</p>
          <p></p></div>
        <div className="links"></div>
        <div className="button-group flex">
          <div className="theme_button">
            <Button variant="outline" onClick={HandleTheme}>
               <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"/>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            </Button>
          </div>
          <div className="signup mx-2">
           <Link href={'/signup'}>
           <Button variant={'outline'}>
              <p className="text-md">SignUp</p>
            </Button>
           </Link>
          </div>
          <div className="getstarted mx-2">
           <Link href={'/onboarding'}>
            <Button variant={"custom"}>
              Get started <MoveRight />
            </Button>
           </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar;