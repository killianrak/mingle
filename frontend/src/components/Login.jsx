import { useEffect, useState } from "react"
import { Toaster, toast } from 'sonner'

function Login() {

    const urlObject = new URL(window.location.href);
    const searchParams = urlObject.searchParams;

    // Utilisez get() pour récupérer la valeur d'un paramètre spécifique
    const code = searchParams.get('code');
     
    useEffect(() => {
        if (code) {
            const json = { idToken: code }
            const res = fetch("http://localhost:8000/auth/google", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(json)
            }).then(data => {
                if (data && data.detail) {
                    toast.error(data.detail)
                }
                else {
                    window.location.href = "/dashboard"
                }
            })


        }

    }, [])

    const [user, setUser] = useState(null)
    const [pwd, setPwd] = useState(null)

    const handlePwd = (e) => {
        setPwd(e.target.value)
    }

    const handleUser = (e) => {
        setUser(e.target.value)
    }

    const handleLogin = () => {
        if (user !== null && pwd !== null) {

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
                    if (res.status === 401) {
                        toast.error("Username or password doesn't match.")
                    }
                    else if (res.status === 200) {
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
        if (res.ok) {
            const response = await res.json()
            console.log(response.url)
            window.open(response.url)
        }
    }
    return <div class="w-full h-screen flex justify-center py-12 bg-gray-100 dark:bg-gray-800">
        <div class="container grid max-w-6xl h-min items-center gap-6 px-4 space-y-6 lg:gap-10 lg:px-6">
            <div class="space-y-2">
                <h1 class="text-3xl font-bold">Login to your account</h1>
                <p class="text-gray-500 dark:text-gray-400">
                    Doesn't have an account ?
                    <a class="underline ml-4" href="/signup">
                        Sign up
                    </a>
                </p>
            </div>
            <div class="border rounded-lg border-gray-200 dark:border-gray-800">
                <div class="p-6 space-y-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="username">Username</label>
                        <input value={user} id="username" onChange={handleUser} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mx-auto " placeholder="User" type="string" />
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="username">Password</label>
                        <input value={pwd} onChange={handlePwd} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mx-auto" placeholder="Password" type="password" />

                    </div>
                    <button onClick={handleLogin} class="inline-flex text-white items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full" style={{ backgroundColor: "rgb(43, 96, 194)" }}>Login</button>
                    <button onClick={googleLogin} class="inline-flex text-white items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full" style={{ backgroundColor: "rgb(43, 96, 194)" }} >
                        Login with Google
                    </button>


                </div>
            </div>
        </div>
        <Toaster richColors closeButton />
    </div>
}



export { Login }