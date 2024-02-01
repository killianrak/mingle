import {useEffect, useRef} from 'react'

function CutTimes({name, times}){

    return <div className="space-y-2">
        
            <div
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {name}
            </div>
                
                <div className="grid gap-2 grid-cols-5 md:grid-cols-10 overflow-y-auto h-20 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {Object.values(times)}                   
                </div>        
        </div>
}

function Times({time,id, setRef}) {

    const ref = useRef(null)
    
    useEffect(() => {
        setRef(ref)
    }, [])
    
    return <>
        <div ref={ref} id={id} className="flex h-5 pl-2 text-center rounded-sm flex-row bg-slate-400 w-14 cursor-pointer">
            <div className="text-center rounded-sm"><span className="text-white font-mono">{time}</span></div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-white w-3 h-3 cursor-pointer">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg> 
        </div>
    </>
}

export {CutTimes, Times}