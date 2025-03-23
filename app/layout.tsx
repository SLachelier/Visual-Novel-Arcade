import "./globals.css";
import StarryBackground from "../components/StarryBackground";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: 'Visual Novel Arcade',
  description: 'A collection of free visual novels to play in your browser.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='!scroll-smooth'>
      <body className="">
      <StarryBackground />
        <Header/>
          {children}
        <Footer/>
      </body>
    </html>
  )
}