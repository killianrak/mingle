import axios from "axios";

const munjiAxios = axios.create({
    baseURL: "http://localhost:8000",

})

export { munjiAxios }