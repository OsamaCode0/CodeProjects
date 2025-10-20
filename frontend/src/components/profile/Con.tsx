import "bulma/css/bulma.min.css";
import "../../styles/viewProfile.css";
import { useLogout } from "../../auth/useLogout";
import { useCon } from "../../hooks/useCon";
import { Link } from "react-router-dom";
import { disconnectUser } from "../../hooks/postDisconnect";

export default function ConnectionsForm() {
  const logout = useLogout();

  const { loading, error, data } = useCon();
  return (
    <section className="section has-background-light">
      <Link to="/connections/requests" className="button is-link is-light mt-3">
        View connection requests
      </Link>
      <button className="button is-dark logout" onClick={() => logout()}>
        Log out
      </button>
      <div className="container">
        <div className="recommendations-container">
          <h1 className="title has-text-centered">Your connections</h1>
        </div>

        {loading && <p>Loading connections…</p>}
        {error && <p className="has-text-danger">{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p>No connections found.</p>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="columns is-multiline">
            {data.map((p) => {
              return (
                <div className="column is-12" key={p.id}>
                  <article className="box">
                    <h2 className="title is-5">{p.name}</h2>
                    <p className="is-size-6 has-text-grey">{p.addressCity}</p>
                    <p className="mt-2">
                      <strong>Child:</strong> {p.child.name}
                      <br />
                      <strong>Age:</strong> {p.child.ageYears}
                    </p>
                    <div className="buttons-container mt-3">
                      <button 
                      className="button con is-danger"
                      onClick={()=> { disconnectUser(p.id) 
                        .then(() => window.location.reload()) // 👈 reload after success
                        .catch((err) => console.error("Disconnect failed:", err));
                      }}
                      >Disconnect</button>
                      <button className="button con is-success">Chat</button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
