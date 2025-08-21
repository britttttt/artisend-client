import Navbar from '../components/navbar'
import { AppWrapper } from '../context/state'  
import '../styles/globals.css' 

function MyApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      <Navbar/>
      <Component {...pageProps} />
      <div class="left-rail" aria-hidden="true"></div>
    </AppWrapper>
  )
}

export default MyApp