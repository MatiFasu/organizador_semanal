import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CourseDetail } from './components/CourseDetail';
import { WeeklyBoard } from './components/WeeklyBoard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route path="schedule" element={<WeeklyBoard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
