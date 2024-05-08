import { useState } from "react"
import { Toaster, toast } from 'sonner'

function Signup() {

    const [user, setUser] = useState("")
    const [email, setEmail] = useState(null)
    const [pwd, setPwd] = useState(null)

    const handleUser = (e) => {
        setUser(e.target.value)
    }

    const handleEmail = (e) => {
        setEmail(e.target.value)
    }

    const handlePwd= (e) => {
        setPwd(e.target.value)
    }

    const handleSignup = () => {
        if(user !== null && email !== null && pwd !== null)
        {
            fetch("http://localhost:8000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email, username: user, password: pwd })
            })
            .then(res => {
                if(res.status == 200){

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

                    toast.info("Signed up Succesfully")

                    return 200
                }
                else if(res.status == 422){
                    toast.error("Please enter a valid email.")
                    return 422
                }
                else if(res.status == 409){
                    toast.error("This email is already used")
                    return 409
                }

            })       
        }
        else {
            toast.warning("Please fill all the fields.")
        }

    }

    return <div className="w-full h-screen flex justify-center py-12 bg-gray-100">
        <div className="container grid max-w-6xl h-min items-center gap-6 px-4 space-y-6 lg:gap-10 lg:px-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Create an account</h1>
                <p className="text-gray-500">
                    Already have an account?
                    <a className="underline ml-4" href="/signin">
                        Sign in
                    </a>
                </p>
            </div>
            <div className="border rounded-lg border-gray-200">
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">Username</label>
                        <input value={user} onChange={handleUser}  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="username" required="" />
                    </div>
                    <div className="space-y-2"><label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">Email</label>
                        <input value={email} onChange={handleEmail} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="email" placeholder="m@example.com" required="" type="email" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">Password</label>
                        <input value={pwd} onChange={handlePwd} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="password" required="" type="password" />
                    </div>
                    <button onClick={handleSignup} className="inline-flex text-white items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full" style={{ backgroundColor: "rgb(43, 96, 194)" }}>
                        Sign up
                    </button>
                </div>
            </div>
        </div>
        <Toaster richColors closeButton />
    </div>
}

export { Signup }