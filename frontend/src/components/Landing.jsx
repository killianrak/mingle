import { useState, useEffect, useRef } from "react"
import { Input } from "../../components/ui/input";
import { Toaster, toast } from 'sonner'

import { munjiAxios } from "../scripts/axiosConfig.js";

function Landing() {

    const [index, setIndex] = useState(0)
    const ref = useRef(null)
    const slides = [
        {
            url: 'preview.png'
        },
        {
            url: 'preview1.png'
        },
        {
            url: 'preview2.png'
        }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const joinWaitList = (e) => {

        const emailRegex = /^[a-z0-9._%+-]+@[a-z.-]+\.[a-zA-Z]{2,}$/;

        e.preventDefault()
        console.log(ref.current.value)
        if (ref.current.value != null) {

            if (emailRegex.test(ref.current.value)) {
                try {
                    fetch("http://localhost:8000/subscribe", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email: ref.current.value })
                    })
                    .then(response => {
                        if (response.ok) {
                            toast.info("Successfully subscribed!");
                        } else {
                            if(response.status == 429){
                                toast.warning("Please wait before adding a new email")
                            }
                            else if(response.status == 409){
                                toast.warning("Email already subscribed.")
                            }
                        }
                    })
                        .catch((e) => {
                            if (e.response.status == 429) {
                                toast.warning("Please wait before adding a new email.")
                            }
                            throw new Error('Error during the request')
                        })

                }
                catch (e) {
                    console.log("catch 2")
                    throw new Error('Error during the request')
                }

            }
            else {
                console.log(ref.current.nodeValue)
                toast.info("Please enter a valid email adress")
            }
        }
        else {
            toast.info("Please enter a valid email adress")
        }
    }

    return <div className="flex flex-col min-h-screen bg-white">

        <header className="flex items-center justify-between px-6 py-4 bg-[#2B60C2] ">
            <a className="flex mr-2 items-center gap-2 font-semibold" href="#">
                <img src="logo.png" alt="" className="w-12 rounded-sm" />
                <span className="text-white">Munji</span>
            </a>
            <nav className="hidden md:flex gap-6">
                <a className="text-white hover:text-gray-900" href="#features">
                    Features
                </a>
                <a className="text-white hover:text-gray-900" href="#faq">
                    FAQ
                </a>
                <a className="text-white hover:text-gray-900" href="#">
                    Contact
                </a>
            </nav>
            <a href="/signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ml-auto bg-white text-[#2B60C2]">Get started</a>
        </header>
        <main className="flex-1 flex flex-col justify-center items-center">
            <section className="w-full h-screen sm-h:my-28 md:my-0 py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center align-baseline items-center">

                <div className="container xs-h:mt-28 flex flex-col md:flex-row px-4 md:px-6">

                    <div className="w-full flex  sm:mt-auto justify-center mr-16 md:w-auto h-full">
                        <div className="hidden md:block md:w-auto flex justify-center h-full items-center border-solid border-8 rounded-md mb-8 md:mb-0 duration-500" style={{ backgroundImage: `url(${slides[index].url})`, backgroundPosition: "center", height: 600, width: 300, objectFit: "cover", aspectRatio: 250 / 500 }}>


                        </div>
                        <div className=" md:hidden flex justify-center items-center border-solid border-8 rounded-md mb-8 md:mb-0 duration-500 bg-cover" style={{ backgroundImage: `url(${slides[index].url})`, backgroundPosition: "center", height: 300, width: 150, objectFit: "cover", aspectRatio: 250 / 500 }}>


                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-4 text-center">

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-5xl/none text-[#2B60C2]">
                                Facilitate Your Life with Our Automated Video Cutting and Overlay Solution for Repost Videos!
                            </h1>
                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Transform your content into a TikTok-friendly format in just a few clicks, with automatic gameplay overlay for unparalleled impact!
                            </p>
                            <p className="mx-auto max-w-[700px] font-bold md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed ">
                                Join the waitlist and get 5 free hours of video traitments with unlimited customized cut times !
                            </p>

                        </div>

                        <div className="md:space-x-4 flex flex-col md:flex-row items-center space-y-4 md:space-y-0">


                            <a className="inline-flex md:w-56 h-9 items-center justify-center rounded-md border border-gray-200 border-gray-200 bg-white px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50" href="#features">
                                Learn More
                            </a>

                            <a href="/signup" className="inline-flex md:w-56 h-9 items-center justify-center rounded-md bg-[#2B60C2] px-8 py-2 text-sm font-medium text-gray-50 shadow-md transition-colors hover:bg-[#2B60C2]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50">
                                Get Sarted
                            </a>

                        </div>
                    </div>
                </div>
            </section>
            <section className="w-full xs-h:mt-28 md:h-screen bg-[#2B60C2] flex flex-col items-center" id="features">
                <div className="bg-[#e0f2fe] px-6 py-12 w-full">
                    <div className="max-w-md mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">
                            Boost your revenue with the substantial time savings provided by this tool.
                        </h2>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-[#1e40af] text-9xl mx-auto mb-6"
                        >
                            <path d="M4 10h12"></path>
                            <path d="M4 14h9"></path>
                            <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"></path>
                        </svg>
                    </div>
                </div>
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <div className="inline-block rounded-lg bg-[#2B60C2] mt-8 px-3 py-1 text-sm text-white">
                                Automated Cutting and Overlay for TikTok/YouTube Shorts!
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                                Let Automation Take the Lead!
                            </h2>
                            <p className="max-w-[900px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Our solution automates according to parameters of your choice the cutting process while adding a gameplay overlay below. Get impactful TikTok reposts in no time!
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto grid mt-8 gap-6 py-12 lg:grid-cols-5 lg:gap-12">
                        <div className="flex flex-col items-center space-y-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-white ">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" x2="12" y1="3" y2="15"></line>
                            </svg>
                            <h3 className="text-xl font-bold text-white">Fast Import</h3>
                            <p className="text-white">Upload your YouTube videos in an instant.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-white">
                                <path d="M12 8V4H8">

                                </path>
                                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                                <path d="M2 14h2"></path>
                                <path d="M20 14h2"></path>
                                <path d="M15 13v2"></path>
                                <path d="M9 13v2"></path>
                            </svg>
                            <h3 className="text-xl font-bold text-white">Smart Automation</h3>
                            <p className="text-white ">Our tool automatically cuts and overlays the gameplay.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-white ">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <h3 className="text-xl font-bold text-white">Easy Customization</h3>
                            <ul className="text-white flex flex-col space-y-4">
                                <li>Set the minimum duration for each video.</li>
                                <li>Specify all the times where the video should be cut.</li>
                                <li>Set the minimum duration for each video plus a specified time in seconds for the video to start x seconds before the previous one ends.</li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-12 w-12 text-white "
                            >
                                <path d="M7 13h4"></path>
                                <path d="M15 13h2"></path>
                                <path d="M7 9h2"></path>
                                <path d="M13 9h4"></path>
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"></path>
                            </svg>
                            <h3 className="text-xl font-bold text-white">Automatic Subtitling</h3>
                            <p className="text-white">Add subtitles to your videos with a single click.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-12 w-12 text-white "
                            >
                                <path d="m5 8 6 6"></path>
                                <path d="m4 14 6-6 2-3"></path>
                                <path d="M2 5h12"></path>
                                <path d="M7 2h1"></path>
                                <path d="m22 22-5-10-5 10"></path>
                                <path d="M14 18h6"></path>
                            </svg>
                            <h3 className="text-xl font-bold text-white">Language Conversion</h3>
                            <p className="text-white ">
                                Our AI-powered tool can convert the language of your videos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="w-full py-12 md:py-24 lg:py-32 bg-white flex justify-center items-center" id="faq">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#2B60C2]">
                                Frequently Asked Questions
                            </h2>
                        </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-1 lg:gap-12">

                        <details className="flex flex-col space-y-4">
                            <summary className="text-xl font-bold cursor-pointer text-[#2B60C2]">How do I use the automation tool ?</summary>
                            <p className="text-gray-500 "> It's simple! Just upload your main YouTube video and gameplay, then click "Start" to begin the automation. Let our tool handle the heavy lifting for you.</p>
                        </details>
                        <details className="flex flex-col space-y-4">
                            <summary className="text-xl font-bold cursor-pointer text-[#2B60C2]">Can I customize the duration of each video?</summary>
                            <p className="text-gray-500 ">Absolutely! You have full control. You can specify the minimum duration of each video according to your preferences.</p>
                        </details>
                        <details className="flex flex-col space-y-4">
                            <summary className="text-xl font-bold cursor-pointer text-[#2B60C2]">Can I make the video starts before x seconds the previous one ended?</summary>
                            <p className="text-gray-500 ">Yes, you have the flexibility to make the video start before x. Customize the start to create a smooth and captivating experience.</p>
                        </details>
                        <details className="flex flex-col space-y-4">
                            <summary className="text-xl font-bold cursor-pointer text-[#2B60C2]">How do I specify the moments to cut the video?</summary>
                            <p className="text-gray-500 ">You have precise control over the cutting points! Simply indicate all the times you want to cut the video, and our tool will take care of the rest.</p>
                        </details>
                        <details className="flex flex-col space-y-4">
                            <summary className="text-xl font-bold cursor-pointer text-[#2B60C2]">Do I need to stay in front of the computer during the automation process?</summary>
                            <p className="text-gray-500 ">No, our tool is designed to work in the background. You can start the automation process and attend to other tasks while the tool works for you.</p>
                        </details>
                        <details className="flex flex-col space-y-4">
                            <summary className="text-xl font-bold cursor-pointer text-[#2B60C2]"> Can I cancel the automation process in progress?</summary>
                            <p className="text-gray-500 ">Yes, our tool is flexible. You can cancel the automation process at any time if you need to make adjustments or change your mind.</p>
                        </details>
                        <details className="flex flex-col space-y-4">
                            <summary className="text-xl font-bold cursor-pointer text-[#2B60C2]">Where can I get help if I have additional questions?</summary>
                            <p className="text-gray-500 ">For any additional questions, feel free to contact rakoto.killian@gmail.com . Here to assist you!</p>
                        </details>
                    </div>
                </div>
            </section>
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[#2B60C2]">
            <p className="text-xs text-[#2B60C2] ">
                © 2024 Munji. All rights reserved.
            </p><nav className="sm:ml-auto flex gap-4 sm:gap-6"><a className="text-xs hover:underline underline-offset-4 text-[#2B60C2]" href="#">
                Terms of Service
            </a><a className="text-xs hover:underline underline-offset-4 text-[#2B60C2]" href="#">
                    Privacy
                </a>
            </nav>
        </footer>
        <Toaster richColors closeButton />
    </div>
}

export { Landing }