import { useEffect } from "react";
import { NavItem } from "./NavItem"
import { useRef } from "react"
import { NavLink } from "react-router-dom";
import { memo } from "react";

const NavbarMemo = memo(function Navbar({refButton}){
    console.log("rendered")
    const ref = useRef(null)

    useEffect(() => {
        const handleClick = () => {
          ref.current.classList.toggle('hidden');
        };
    
        if (refButton.current) {
          refButton.current.addEventListener('click', handleClick);
        }
    
        return () => {
          // Retirer l'écouteur d'événements lors du démontage du composant
          if (refButton.current) {
            refButton.current.removeEventListener('click', handleClick);
          }
        };
      }, []);


    return <>

        <div className="md:hidden bg-sky-800 z-50 hidden text-white fixed inset-y-0 left-0" ref={ref} id="mobile-menu">
            <nav className="flex flex-col p-6">
                <h2 className="font-semibold text-lg mb-4">Navigation</h2>
                <NavLink to="/dashboard"><NavItem name="Dashboard"/></NavLink>
                <NavLink to="/dashboard/settings"><NavItem name="Account Settings" /></NavLink>
                <NavItem name="Logout" />
            </nav>
        </div>
        <nav className="w-64 flex flex-col p-6 hidden bg-sky-800 text-white md:flex">
                <h2 className="font-semibold text-lg mb-4">Navigation</h2>
                <NavLink to="/dashboard"><NavItem name="Dashboard" /></NavLink>
                <NavLink to="/dashboard/settings"><NavItem name="Account Settings" /></NavLink>
                <NavItem name="Logout" />
        </nav>              

  
    </>
})

export { NavbarMemo }