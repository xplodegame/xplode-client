import { usePrivy } from '@privy-io/react-auth';
import Home from './pages/Home/Home';
import MainApp from './MainApp';

export default function App() {
  const { authenticated } = usePrivy();

  return (
    <div className="bg-gray-900 min-h-screen">
      {!authenticated ? <Home /> : <MainApp />}
    </div>
  );
}