import { createContext,useContext, useEffect, useState, useRef } from 'react'
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { NavbarMemo } from './components/Navbar'
import { HeaderMemo } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Settings } from './components/Settings'
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
const LoadingContext = createContext();

const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: <Body />,
    children: [
      {
        path: '',
        element: <DashboardWithContext />

      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }, 
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/signin',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  }
  
 

])
function App() {

  return <RouterProvider router={router} />


}

function Body() {

  const LOADING = 0
  const ERROR = 1
  const SUCCESS = 2
  const EMPTY = 3

  const [loading, setLoading] = useState(false)
  const [currentState, setCurrentState] = useState(EMPTY)
  const [allLoad, setLoadAll] = useState(false)
  console.log("rerender body")
  const ref = useRef(null)

  
  fetch("http://localhost:8000/check-cookie", {
    method: "GET",
    credentials: "include",
    headers: {
        'accept': 'application/json'
    }  // Inclure les cookies dans la requête
    })
    .then(response => {
        if (response.status !== 200) {
            window.location.href = "/signin"
        }
        else {
          setLoadAll(true)
        }
        
    })

  return <LoadingContext.Provider value={{ loading, setLoading, currentState, setCurrentState }}>
    {allLoad && <div className="flex">
      <NavbarMemo refButton={ref} />

      <div className="flex flex-col flex-grow">
        <HeaderMemo refButton={ref} />

        <Outlet />
      </div>
    </div>
    }
  </LoadingContext.Provider>
  

}

function DashboardWithContext() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { currentState, setCurrentState } = useContext(LoadingContext)

  // Utilisez l'état et la fonction ici
  return <Dashboard load={loading} setLoading={setLoading} setCurrentState={setCurrentState} currentState={currentState}  />;
}

export default App

