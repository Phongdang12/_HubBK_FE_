// src/routes/AppRoutes.tsx
import { RouteObject } from 'react-router-dom';
import Login from '@/pages/login/Login';
import Home from '@/pages/home/Home';
import Dashboard from '@/pages/dashboard/Dashboard';
import PrivateRoute from '@/routes/PrivateRoute';
import Students from '@/pages/students/Students';
import Statistics from '@/pages/statistics/Statistics';
import AddStudent from '@/pages/addstudent/AddStudent';
import Rooms from '@/pages/rooms/Rooms';
import ViewStudentPage from '@/pages/students/ViewStudentPage';
import EditStudentPage from '@/pages/students/EditStudentPage';
import Disciplines from '@/pages/discipline/Disciplines';
import AddDiscipline from '@/pages/discipline/AddDisciplinePage';
import EditDisciplinePage from '@/pages/discipline/EditDisciplinePage';
import ViewDisciplinePage from '@/pages/discipline/ViewDisciplinePage';
import ViewRoomPage from '@/pages/rooms/ViewRoomPage';
import EditRoomPage from '@/pages/rooms/EditRoomPage';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },

  // Dashboard route: hiện tại không có children — bây giờ thêm children CHỈ CHO discipline
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
    children: [
      // Nếu bạn muốn, có thể thêm mặc định vào Students ở đây, nhưng để tránh đụng chạm
      // tôi chỉ thêm discipline routes vào children, giữ nguyên các route phía ngoài.
      { path: 'disciplines', element: <Disciplines /> },
      { path: 'disciplines/add', element: <AddDiscipline /> },
      { path: 'disciplines/view/:action_id', element: <ViewDisciplinePage /> },
      { path: 'disciplines/edit/:action_id', element: <EditDisciplinePage /> },
    ],
  },

  // Các route hiện có khác giữ nguyên (không thay đổi)
  {
    path: '/students',
    element: (
      <PrivateRoute>
        <Students />
      </PrivateRoute>
    ),
  },
  {
    path: '/students/:ssn',
    element: (
      <PrivateRoute>
        <Students />
      </PrivateRoute>
    ),
  },
  {
    path: '/students/view/:ssn',
    element: (
      <PrivateRoute>
        <ViewStudentPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/students/edit/:ssn',
    element: (
      <PrivateRoute>
        <EditStudentPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/statistics',
    element: (
      <PrivateRoute>
        <Statistics />
      </PrivateRoute>
    ),
  },
  {
    path: '/students/add',
    element: (
      <PrivateRoute>
        <AddStudent />
      </PrivateRoute>
    ),
  },
  {
    path: '/rooms',
    element: (
      <PrivateRoute>
        <Rooms />
      </PrivateRoute>
    ),
  },

  // giữ nguyên route /disciplines cũ để không phá link đang dùng
  {
    path: '/disciplines',
    element: (
      <PrivateRoute>
        <Disciplines />
      </PrivateRoute>
    ),
  },
  {
    path: '/disciplines/add',
    element: (
      <PrivateRoute>
        <AddDiscipline />
      </PrivateRoute>
    ),
  },
  {
    path: '/disciplines/view/:action_id',
    element: (
      <PrivateRoute>
        <ViewDisciplinePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/disciplines/edit/:action_id',
    element: (
      <PrivateRoute>
        <EditDisciplinePage />
      </PrivateRoute>
    ),
  },
    {
    path: '/rooms/view/:buildingId/:roomId',
    element: (
      <PrivateRoute>
        <ViewRoomPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/rooms/edit/:buildingId/:roomId',
    element: (
      <PrivateRoute>
        <EditRoomPage />
      </PrivateRoute>
    ),
  },
];
