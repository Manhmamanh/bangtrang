import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './utils/store';
import { authAPI } from './utils/api';
import LoginPage from './pages/LoginPage';
import BoardsPage from './pages/BoardsPage';
import EditorPage from './pages/EditorPage';
import './styles/app.css';

function App() {
  const { token, user, login } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      authAPI.getMe().then((res) => {
        login(res.data, token);
      });
    }
  }, [token, user, login]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <></>}
        />
        <Route
          path="/"
          element={token ? <BoardsPage /> : <LoginPage />}
        />
        <Route
          path="/board/:boardId"
          element={token ? <EditorPage /> : <LoginPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
