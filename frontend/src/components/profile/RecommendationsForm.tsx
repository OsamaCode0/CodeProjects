import "bulma/css/bulma.min.css";
import { useLogout } from "../../auth/useLogout";

export default function RecommendationsForm(){
    const logout = useLogout(); 
    return(
    <section className="section has-background-light">
        <button
        className="logout button is dark"
        onClick={()=>logout()}>
            Log out 
        </button>
    </section>
);
}
