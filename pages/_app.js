// pages/_app.js
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import "../styles/globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const hideNavbar = router.pathname === "/login" || router.pathname === "/signup"; // hide on login/signup

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
