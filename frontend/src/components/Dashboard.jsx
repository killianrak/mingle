import { Input } from './Input'
import { useEffect, useRef, useState } from 'react'
import { CutTimes, Times } from './CutTimes'
import { v4 as uuidv4 } from 'uuid';
import { Toaster, toast } from 'sonner'
import { Status } from './Status';

const LOADING = 0
const ERROR = 1
const SUCCESS = 2
const EMPTY = 3


function Dashboard({ setLoading, load, setCurrentState, currentState }) {

    console.log("dashboard rendered")
    const refCut = useRef(null)
    const [minute, setMinute] = useState(0)
    const [seconds, setSeconds] = useState(0)
    const [allTimes, setAllTimes] = useState({})
    const [timeRef, setTimeRef] = useState({})
    const [previousLength, setPreviousLength] = useState(0);
    const [videoFile, setVideoFile] = useState(null)
    const [gameplayFile, setGameplayFile] = useState(null)
    const [minimumMinutes, setMinimumMinutes] = useState(null)
    const [startBefore, setStartBefore] = useState(null)
    const [startBeforeOption, setStartBeforeOption] = useState(false)
    const [customCutOption, setCustomCutOption] = useState(false)
    const [error, setError] = useState('')


    const handleStartBeforeOption = (e) => {
        setStartBeforeOption(e.target.checked)
        if (customCutOption) {
            setCustomCutOption(!e.target.checked)
        }

    }

    const handleCutOption = (e) => {
        setCustomCutOption(e.target.checked)
        if (startBeforeOption) {
            setStartBeforeOption(!e.target.checked)
        }

    }


    const handleVideo = (e) => {
        console.log(e)
        setVideoFile(e)
    }

    const handleGameplay = (e) => {

        setGameplayFile(e)
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

    const downloadToFile = (content, filename, contentType) => {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });

        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    const fetchData = async (video_data, endpoint) => {
        const formData = new FormData()
        formData.append("video_upload", videoFile)
        formData.append("gameplay_upload", gameplayFile)

        try {

            setLoading(true)
            setCurrentState(LOADING)
            const res = await fetch(`http://localhost:8000/${endpoint}?video_data=${encodeURIComponent(JSON.stringify(video_data))}`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                })
            setLoading(false)
            setCurrentState(SUCCESS)
            if (res.status == 200) {
                const content = await res.blob()
                downloadToFile(content, "munji_video.zip", res.headers["content-type"])
            }
            else {
                const error = await res.json()
                throw new Error(error.detail)
            }



        } catch (e) {

            setCurrentState(ERROR)
            setError(e.message)
        }
    }
    const handleSubmit = async () => {
        let controlPassed = true
        if (!videoFile || !gameplayFile) {
            toast.error("Les deux vidéos doivent être renseignées")
            controlPassed = false
        }
        if (Object.keys(allTimes).length > 0 && (minimumMinutes != null && minimumMinutes != 0 || startBefore != null && startBefore != 0)) {
            toast.error("Si vous choisissez de personnaliser les times cut, vous ne pouvez ni spécifier de durée minimum, ni commencer X secondes avant.")
            controlPassed = false
        }
        if ((startBefore != null && startBefore != 0) && (minimumMinutes == 0 && minimumMinutes == null)) {
            toast.error("Si vous décidez de commencer chaques cut X secondes avant, veuillez renseigner une durée minimum pour chaques vidéos")
            controlPassed = false
        }
        if (Object.keys(allTimes).length == 0 && (minimumMinutes == null || minimumMinutes == 0)) {
            toast.error("Veuillez au minimum rentrer soit une durée minimum pour chaques vidéos, soit des times cut personnalisés.")
            controlPassed = false
        }

        if (controlPassed && currentState != LOADING) {

            if ((minimumMinutes && minimumMinutes != 0) && (startBefore == null || startBefore == 0)) {
                const video_data = { 'divide_each_minutes': minimumMinutes }
                const endpoint = "traitement-minimum"
                fetchData(video_data, endpoint)

            }
            else if ((minimumMinutes && minimumMinutes != 0) && (startBefore && startBefore != 0)) {
                const video_data = { 'divide_each_minutes': minimumMinutes, 'start_before': startBefore }
                const endpoint = "traitement-before"
                fetchData(video_data, endpoint)
            }
            else if (Object.keys(allTimes).length > 0) {
                let allCheckPoints = []
                Object.keys(allTimes).forEach(e => {
                    console.log(allTimes[e].props.time)
                    let time = allTimes[e].props.time
                    time = time.slice(0, -1);
                    time = time.split("\"")
                    let checkPointsSeconds = (parseInt(time[0]) * 60) + parseInt(time[1])
                    allCheckPoints.push(String(checkPointsSeconds))
                })
                const video_data = { "checkpoints": allCheckPoints }
                const endpoint = "traitement-checkpoints"
                fetchData(video_data, endpoint)
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

                            {!customCutOption && <Input name="Minimum duration in minutes" type="number" id="minimum-duration" readOnly={false} onChange={setMinimumMinutes} value={minimumMinutes} />}
                            {startBeforeOption && <Input name="Start before X seconds the last video ended" type="number" id="start-before" readOnly={false} onChange={setStartBefore} value={startBefore} />}
                            {customCutOption && <CutTimes name="Precise all the cut times" times={allTimes} />}
                            {customCutOption && <button onClick={show} className="flex flex-start bg-sky-700 text-white p-2 pl-4 rounded-md w-24 text-center">
                                Add cut
                            </button>}

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
                            <div className="flex flex-col bg-slate-100 rounded-md p-4">
                                <h1 className="text-center font-bold">Options</h1>
                                <div className="flex flex-row-reverse justify-end mt-4">
                                    <div className="flex flex-col">
                                        <label htmlFor="start-before-check" className="cursor-pointer">Start before X seconds the last video ended</label>
                                        <label htmlFor="all-cut-times" className="pr-4 cursor-pointer">Precise the customized cut times</label>
                                    </div>
                                    <div className="flex flex-col justify-around mr-4">
                                        <input checked={startBeforeOption} onChange={handleStartBeforeOption} name="start-before-check" type="checkbox" id="start-before-check" className="cursor-pointer" />
                                        <input checked={customCutOption} onChange={handleCutOption} name="all-cut-times" type="checkbox" id="all-cut-times" className="cursor-pointer" />
                                    </div>
                                </div>



                            </div>

                        </div>


                    </div>
                </main >

            </div>
        </div>
        <Toaster richColors closeButton />
    </>

}

export { Dashboard }