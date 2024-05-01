import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <footer className="text-center mt-4 font-bold">Developed by {" "}
        <a className="text-blue-800 cursor-pointer" href="https://nihar.vispute.in/">
          Nihar Vispute </a>
      </footer>
    </>
  )
}
