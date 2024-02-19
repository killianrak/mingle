import { Input } from './Input'
import { useEffect, useRef, useState } from 'react'
import { CutTimes, Times } from './CutTimes'
import { v4 as uuidv4 } from 'uuid';
import { Toaster, toast } from 'sonner'
import { Status } from './Status';
import { redirect } from "react-router-dom";

const LOADING = 0
const ERROR = 1
const SUCCESS = 2
const EMPTY = 3

function Dashboard({ setLoading, load, setCurrentState, currentState }) {

    console.log("dashboard rendered")
    const [loadAll, setLoadAll] = useState(false)
    const refCut = useRef(null)
    const [minute, setMinute] = useState(0)
    const [seconds, setSeconds] = useState(0)
    const [allTimes, setAllTimes] = useState({})
    const [timeRef, setTimeRef] = useState({})
    const [previousLength, setPreviousLength] = useState(0);
    const [videoFile, setVideoFile] = useState(null)
    const [gameplayFile, setGameplayFile] = useState(null)
    const [files, setFiles] = useState([])
    const [minimumMinutes, setMinimumMinutes] = useState(null)
    const [startBefore, setStartBefore] = useState(null)

    const [error, setError] = useState('')

    const handleVideo = (e) => {
        setVideoFile(e.target.files[0])
    }

    const handleGameplay = (e) => {
        setGameplayFile(e.target.files[0])
    }

    const close = () => {
        if (!refCut.current.classList.contains('hidden')) {
            refCut.current.classList.add('hidden')
        }
    }
    const show = () => {
        if (refCut.current.classList.contains('hidden')) {
            refCut.current.classList.remove('hidden');
        }
    };

    const handleMinute = (e) => {

        setMinute(e.target.value)
    }

    const handleSeconds = (e) => {

        setSeconds(e.target.value)
    }

    useEffect(() => {

        if (Object.keys(timeRef).length > previousLength) {
            console.log('witness')

            Object.values(timeRef).forEach((time) => time.addEventListener('click', deleteTimes))
            setPreviousLength(Object.keys(timeRef).length);
        }

    }, [timeRef, previousLength])



    const deleteTimes = (e) => {

        setAllTimes((prev) => {
            const newAllTimes = { ...prev }
            delete newAllTimes[e.currentTarget.id]

            return newAllTimes
        })

        setTimeRef((prev) => {
            const newAllTimeRef = { ...prev }
            delete newAllTimeRef[e.currentTarget.id]

            return newAllTimeRef
        })

    }

    const addTime = () => {
        if (minute > 0 || seconds > 0) {

            const parsedTime = minute + '"' + seconds + "'";
            const key = uuidv4();
            const nextTime = <Times
                time={parsedTime}
                setRef={(ref) => {

                    setTimeRef((prev) => {

                        const allTimeRef = { ...prev }
                        allTimeRef[ref.current.attributes.id.nodeValue] = ref.current

                        return allTimeRef;
                    });
                }}
                key={key}
                id={key}
            />
            if (Object.keys(allTimes).length > 0) {
                let alreadyExist = false

                Object.values(allTimes).forEach((time) => {


                    if (Object.values(time)[4].time == nextTime.props.time) {

                        alreadyExist = true

                    }

                })

                if (!alreadyExist) {

                    setAllTimes((prevAllTimes) => {
                        const allNewTimes = { ...prevAllTimes }

                        allNewTimes[key] = nextTime

                        console.log(allNewTimes[key].props)
                        return allNewTimes;
                    });

                    console.log('added');
                }
                else {
                    toast.warning(`${nextTime.props.time} est déja renseigné`)
                }

            }
            else {
                setAllTimes((prevAllTimes) => {
                    const allNewTimes = { ...prevAllTimes }

                    allNewTimes[key] = nextTime

                    return allNewTimes;
                });

                console.log('added');

            }


        }
        else {
            toast.warning("Les deux champs minutes et secondes sont égaux à 0.")
        }



    }

    const handleSubmit = async () => {
        let controlPassed = true
        // if (!videoFile && !gameplayFile) {
        //     toast.error("Les deux vidéos doivent être renseignées")
        //     controlPassed = false
        // }
        // if (Object.keys(allTimes).length > 0 && (minimumMinutes != null || startBefore != null)) {
        //     toast.error("Si vous choisissez de personnaliser les times cut, vous ne pouvez ni spécifier de durée minimum, ni commencer X secondes avant.")
        //     controlPassed = false
        // }
        // if (startBefore != null && minimumMinutes == null) {
        //     toast.error("Si vous décidez de commencer chaques cut X secondes avant, veuillez renseigner une durée minimum pour chaques vidéos")
        //     controlPassed = false
        // }
        // if (Object.keys(allTimes).length == 0 && minimumMinutes == null) {
        //     toast.error("Veuillez au minimum rentrer soit une durée minimum pour chaques vidéos, soit des times cut personnalisés.")
        //     controlPassed = false
        // }

        if (controlPassed) {
            console.log("Controlled passed")
            try {

                setLoading(true)
                setCurrentState(LOADING)
                fetch("http://localhost:8000/traitement-minimum")
                console.log("terminé")
                setLoading(false)
                setCurrentState(SUCCESS)


            } catch (e) {

                setCurrentState(ERROR)
                setError(e.message)
            }
        }


    }


    return <>

       <div className="flex-col h-screen py-8 px-8 md:py-0 md:px-0">

            <div className="flex flex-col flex-grow">

                <main className="flex flex-col flex-1 gap-4 md:gap-8 md:p-6">
                    <div className="flex items-center">
                        <h1 className="font-semibold text-lg md:text-2xl">Automate Your Videos</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4 md:flex md:flex-col">

                            <Input name="Youtube Video" type="file" id="youtube-video" readOnly={false} onChange={handleVideo} accept={"video/*"} />
                            <Input name="Gameplay Video" type="file" id="gameplay-video" readOnly={false} onChange={handleGameplay} accept={"video/*"} />

                            <Input name="Minimum duration in minutes" type="number" id="minimum-duration" readOnly={false} onChange={setMinimumMinutes} />
                            <Input name="Start Before X Seconds the minimum duration" type="number" id="start-before" readOnly={false} onChange={setStartBefore} />
                            <CutTimes name="Precise all the cut times" times={allTimes} />
                            <button onClick={show} className="flex flex-start bg-sky-700 text-white p-2 pl-4 rounded-md w-24 text-center">
                                Add cut
                            </button>

                            <div ref={refCut} className="flex space-x-10 bg-gray-100/40 w-64 rounded-md bg-sky-700 hidden">
                                <div>
                                    <div className="p-2">
                                        <input type="number" name="minutes" min="0" value={minute} onChange={handleMinute} id="minutes" className="w-24 bg-sky-800 text-white p-1 outline-none rounded-md" />
                                        <label htmlFor="minutes" className="text-white pl-2">min</label>
                                    </div>
                                    <div className="p-2">
                                        <input type="number" name="secondes" min="0" max="59" value={seconds} onChange={handleSeconds} id="secondes" className="w-24 bg-sky-800 text-white p-1 outline-none rounded-md" />
                                        <label htmlFor="secondes" className="text-white pl-2">secondes</label>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-10">
                                    <svg onClick={close} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 text-white h-6 cursor-pointer">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                    <svg onClick={addTime} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 bg-sky-800 rounded-md text-white h-6 cursor-pointer">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>

                            </div>
                            <button
                                className="inline-flex bg-sky-700 text-white items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                                type="submit" onClick={handleSubmit}>
                                Start
                            </button>

                        </div>
                        <div className="space-y-4">
                            <Status name="Status" state={currentState} error={error} loading={load} />
                        </div>


                    </div>
                </main >

            </div>
        </div>
        <Toaster richColors closeButton />
        </>

}

export { Dashboard }