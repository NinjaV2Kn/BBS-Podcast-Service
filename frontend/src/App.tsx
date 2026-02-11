import { Routes, Route } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Home from './pages/Home';
import Community from './pages/Community';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import EpisodeDetail from './pages/EpisodeDetail';
import FeedPreview from './pages/FeedPreview';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { ThemeProvider, useTheme } from './ThemeContext';
import { lightTheme, darkTheme } from './theme';

function AppContent() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="community" element={<Community />} />
          
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
    </MUIThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
