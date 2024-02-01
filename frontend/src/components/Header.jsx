import { memo } from "react"

const HeaderMemo = memo(function Header({refButton}){
    
           return <header className="flex h-14 flex-row-reverse md:flex-row justify-between w-full items-center bg-sky-700 gap-4 border-b px-6">
                <div className="block md:hidden mr-auto ml-32">
                    <button ref={refButton} id="menu-toggle" className="text-gray-500 focus:outline-none focus:text-gray-700">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7">
                            </path>
                        </svg>
                    </button>
                </div>
                <div>
                    <a className="flex items-center gap-2 font-semibold" href="#">
                        <img src="logo.png" alt="" className="w-12"/>
                        <span className="text-white text-sm md:text-md">Munji - Auto Cut & Superposition</span>
                    </a>                    
                </div>


            </header>
})

export { HeaderMemo }