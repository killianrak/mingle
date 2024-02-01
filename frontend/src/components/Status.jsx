import ClipLoader from "react-spinners/ClipLoader";

const LOADING = 0
const ERROR = 1
const SUCCESS = 2
const EMPTY = 3

function Status({ name, state, error, loading }) {
    let currentState = null
    if (state == EMPTY) {
        currentState = <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">

        </div>
    }
    else if (state == LOADING) {
        currentState = <div className="flex flex-center text-center bg-blue-200 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <div className="w-full text-blue-600 w-full font-bold">
                <span className="pr-4 align-top">En cours...</span>
      
                <ClipLoader
                    color="#2563EB"
                    loading={loading}
                    size={20}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />                
            </div>
      
        </div>
    }
    else if (state == ERROR) {
        currentState = <div className="flex flex-center text-center bg-red-200 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <span className="text-red-600 w-full font-bold">{error}</span>
        </div>
    }
    else if (state == SUCCESS) {
        currentState = <div className="flex flex-center text-center bg-green-200 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <span className="text-green-600 w-full font-bold">Traitement terminé</span>
        </div>
    }
    return <div className="space-y-2">

        <div
            style={{ marginTop: "8.5px" }}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
            {name}
        </div>

        {currentState}
    </div>
}

export { Status }