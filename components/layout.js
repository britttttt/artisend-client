import Head from 'next/head'
import { AppWrapper } from '../context/state'

export default function Layout({ children }) {
  return (
    <AppWrapper>
      <>
        <Head>
          <title>Artisend</title>
        </Head>
        
        <main className="container mt-6">{children}</main>
      </>
    </AppWrapper>
  )
}
