// src/pages/discipline/AddDisciplinePage.tsx
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import SharedDisciplineForm from './components/SharedDisciplineForm';
// import { Toaster } from 'react-hot-toast'; // <-- XÓA IMPORT

const AddDisciplinePage = () => (
  <div className="flex min-h-screen w-full flex-col">
    <Header />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8">
        <SharedDisciplineForm mode="add" />
        {/* <Toaster /> <-- XÓA TOASTER */}
      </main>
    </div>
    <Footer />
  </div>
);

export default AddDisciplinePage;