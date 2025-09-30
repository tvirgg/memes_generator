import MemeGenerator from "../components/MemeGenerator";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-grow flex items-center justify-center p-4">
        <MemeGenerator />
      </main>
    </div>
  );
}
