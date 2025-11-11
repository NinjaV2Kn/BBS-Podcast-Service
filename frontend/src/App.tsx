import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import EpisodeDetail from './pages/EpisodeDetail';
import FeedPreview from './pages/FeedPreview';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        
        {/* Public auth routes - redirect to dashboard if already logged in */}
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="signup" element={<PublicRoute><Signup /></PublicRoute>} />
        
        {/* Protected routes */}
        <Route path="upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="episodes/:id" element={<EpisodeDetail />} />
        <Route path="feeds/:slug" element={<FeedPreview />} />
      </Route>
    </Routes>
  );
}

export default App;
