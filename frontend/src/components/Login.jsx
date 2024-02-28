import { useEffect, useState } from "react"
import { Toaster, toast } from 'sonner'
import useSWR from 'swr'

function Login() {

    const fetcher = (url, options) => fetch(url, options).then(res => res.json())

    const urlObject = new URL(window.location.href);
    const searchParams = urlObject.searchParams;

    // Utilisez get() pour récupérer la valeur d'un paramètre spécifique
    const code = searchParams.get('code');
    (function(){
        if(code)
            {
                const json = {idToken: code}
                const { data, error, isLoading } = useSWR('http://localhost:8000/auth/google', (url) => fetcher(url, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(json)
                }))

                if(data && data.detail)
                {
                    toast.error(data.detail)
                }
                else {
                    window.location.href = "/dashboard"
                }
  
            }        
    })()

  

    const [user, setUser] = useState(null)
    const [pwd, setPwd] = useState(null)

    const handlePwd = (e) => {
        setPwd(e.target.value)
    }

    const handleUser = (e) => {
        setUser(e.target.value)
    }
    
    const handleLogin = () => {
        if(user !== null && pwd !== null)
        {

            fetch("http://localhost:8000/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'accept': 'application/json'
                },
                body: new URLSearchParams({
                    'username': user,
                    'password': pwd,
                })
            }) 
            .then(res => {
                if(res.status === 401){
                    toast.error("Username or password doesn't match.")
                }
                else if(res.status === 200){
                    window.location.href = "/dashboard"
                }
            })        
        }
        else {
            toast.warning("Please fill all the fields.")
        }

    }


    const googleLogin = async () => {
        const res = await fetch("http://localhost:8000/login/google")
        if(res.ok)
        {
            const response = await res.json()
            console.log(response.url)
            window.open(response.url)
        }
    }
    return <div class="flex flex-col gap-2 min-h-screen items-center justify-center px-4 text-center md:gap-4 bg-[#2B60C2] md:bg-[#f3f4f6]">
                <div className="md:bg-[#2B60C2] p-28 rounded-md">
                    <div class="space-y-2 ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto w-14 h-14 inline-block text-white">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" x2="9.01" y1="9" y2="9"></line>
                        <line x1="15" x2="15.01" y1="9" y2="9"></line>
                        </svg>
                        <h1 class="text-3xl text-white font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Welcome back
                        </h1>
                    <p class="text-gray-500 dark:text-gray-400 text-white pb-2 pt-4">Enter your information below</p>
                    <p class="text-white pb-8">
                    Doesn't have an account ?
                    <a class="underline ml-4 text-white" href="/signup">
                        Sign in
                    </a>
                </p>
                    </div>
                    <div class="w-full max-w-sm space-y-4">
                    <input value={user} onChange={handleUser} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mx-auto " placeholder="User" type="string" />
                    <input value={pwd} onChange={handlePwd} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mx-auto" placeholder="Password" type="password" />
                    <button onClick={handleLogin} class="text-[#2B60C2] bg-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mx-auto w-full">Login</button>
                    <button onClick={googleLogin} class="text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mx-auto w-full" >
                    Login with Google
                    </button> 

                    </div>                    
                </div>
                <Toaster richColors closeButton />
            </div >

}

export {Login}