import Board from './components/Board'

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">To-Do App</h1>
      <Board />
    </div>
  )
}
