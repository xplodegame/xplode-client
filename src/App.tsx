import { usePrivy } from '@privy-io/react-auth';
import Home from './pages/Home/Home';

export default function App() {
  const { authenticated } = usePrivy();

  return (
    <div className="bg-gray-900 min-h-screen">
      {!authenticated ? <Home /> : <Home />}
    </div>
  );
}
