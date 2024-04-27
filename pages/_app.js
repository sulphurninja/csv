import { ThemeProvider } from "@/components/ThemeToggle/theme-provider";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <Component {...pageProps} />;
    </ThemeProvider>
  )
}
