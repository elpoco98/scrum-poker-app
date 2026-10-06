import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="page">
      <section className="panel">
        <h1>404</h1>
        <p>Diese Seite wurde nicht gefunden.</p>
        <Link to="/">Zur Startseite</Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
