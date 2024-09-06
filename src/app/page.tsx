import PokerClubTabs from './components/tabs'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center">Binghamton University Poker Club</h1>
        </div>
      </header>
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <section className="bg-gray-800 rounded-lg shadow-lg p-6">
            <PokerClubTabs />
          </section>
        </div>
      </main>
      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Cole Ritchie. All rights reserved.</p>
      </footer>
    </div>
  )
}