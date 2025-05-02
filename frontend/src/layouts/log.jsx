import { Navbar } from "../components/navbar";

export default function LogLayout({ children }) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container flex-grow mx-auto pt-16 flex items-center justify-center">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <p className="text-default-600">
          uevent by <span className="text-primary"> nezox & t1tandr</span>
        </p>
      </footer>
    </div>
  );
}
