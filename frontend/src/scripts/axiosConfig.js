import axios from "axios";

const munjiAxios = axios.create({
    baseURL: "https://api.mingle.fr/",

})

export { munjiAxios }
