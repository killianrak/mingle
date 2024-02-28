import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { NavbarMemo } from './components/Navbar'
import { HeaderMemo } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Settings } from './components/Settings'
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import useSWR from 'swr'

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
  const fetcher = (url, options) => fetch(url, options).then(res => res.json());

  (function() 
  {
    console.log("called")
    const {data, error, isLoading} = useSWR("http://localhost:8000/check-cookie", (url) => fetcher(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
      accept: 'application/json'
      },
    }))

    console.log(data)
    console.log(error)
    if(data && data.detail)
    {
      console.log("here 2")
      window.location.href = "/signin";
    }
    else {

        setLoadAll(true);
      console.log("here")
    }
  })();
  
  const LOADING = 0
  const ERROR = 1
  const SUCCESS = 2
  const EMPTY = 3

  const [loading, setLoading] = useState(false)
  const [currentState, setCurrentState] = useState(EMPTY)
  const [allLoad, setLoadAll] = useState(false)
  console.log("rerender body")
  const ref = useRef(null)



  // useEffect(() => {
  //   // Use a flag to ensure fetch is called only once
  //   let isMounted = true;
  //   if (isMounted) {

  //     fetch('http://localhost:8000/check-cookie', {
  //       method: "GET",
  //       credentials: "include",
  //       headers: {
  //         accept: "application/json",
  //       },
  //     })
  //       .then((response) => {

  //         if (response.status !== 200) {
  //           window.location.href = "/signin";
  //         } else {
  //           setLoadAll(true);
  //         }

  //       });
  //   }
  //   // Cleanup function to set isMounted to false when the component is unmounted
  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

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
  return <Dashboard load={loading} setLoading={setLoading} setCurrentState={setCurrentState} currentState={currentState} />;
}

export default App

