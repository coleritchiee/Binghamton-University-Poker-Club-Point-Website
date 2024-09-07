import PokerClubTabs from './components/tabs'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-secondary">Binghamton University Poker Club</h1>
        </div>
      </header>
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <section className="bg-card rounded-lg shadow-lg p-6">
            <PokerClubTabs />
          </section>
        </div>
      </main>
      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cole Ritchie. All rights reserved.</p>
      </footer>
    </div>
  )
}