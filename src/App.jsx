// File: src/App.jsx

import { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Import các page component
import AlphabetPage from './pages/AlphabetPage';
import VocabularyPage from './pages/VocabularyPage';
import KanjiPage from './pages/KanjiPage';
import GrammarPage from './pages/GrammarPage';
import FlashcardPage from './pages/FlashcardPage';
import TestPage from './pages/TestPage';
import ImportPage from './pages/ImportPage';

// Import dữ liệu cho navigation
import { NAV_ITEMS } from './constants/navigation';

function App() {
  // Dùng useState để lưu trữ tab nào đang được active
  // Mặc định là tab đầu tiên trong danh sách
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].id);

  // Hàm này sẽ render page component tương ứng với activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'chu-cai':
        return <AlphabetPage />;
      case 'tu-vung':
        return <VocabularyPage />;
      case 'kanji':
        return <KanjiPage />;
      case 'ngu-phap':
        return <GrammarPage />;
      case 'flashcard':
        return <FlashcardPage />;
      case 'bai-test':
        return <TestPage />;
      case 'import':
        return <ImportPage />;
      default:
        return <AlphabetPage />; // Mặc định hiển thị trang chữ cái
    }
  };

  return (
    <>
      <Header />
      <Navigation 
        items={NAV_ITEMS} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <main>
        {renderContent()}
      </main>
      <Footer />
    </>
  );
}

export default App;