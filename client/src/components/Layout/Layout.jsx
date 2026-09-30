import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  return (
    <div className="w-full min-w-0 min-h-screen flex flex-col bg-[#F9F9F9]">
      <Header />
      <main className="w-full min-w-0 flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
