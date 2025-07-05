import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="bg-white min-h-screen text-black">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}