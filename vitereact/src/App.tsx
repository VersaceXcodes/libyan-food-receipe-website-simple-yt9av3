import React from "react";
import { Route, Routes } from "react-router-dom";

/* Import shared views */
import GV_TopNav from '@/components/views/GV_TopNav.tsx';
import GV_Footer from '@/components/views/GV_Footer.tsx';

/* Import unique views */
import UV_Home from '@/components/views/UV_Home.tsx';
import UV_RecipeListing from '@/components/views/UV_RecipeListing.tsx';
import UV_RecipeDetail from '@/components/views/UV_RecipeDetail.tsx';
import UV_SearchResults from '@/components/views/UV_SearchResults.tsx';
import UV_About from '@/components/views/UV_About.tsx';
import UV_Contact from '@/components/views/UV_Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <GV_TopNav />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<UV_Home />} />
          <Route path="/recipes" element={<UV_RecipeListing />} />
          <Route path="/recipes/:id" element={<UV_RecipeDetail />} />
          <Route path="/recipes/search" element={<UV_SearchResults />} />
          <Route path="/about" element={<UV_About />} />
          <Route path="/contact" element={<UV_Contact />} />
        </Routes>
      </main>
      
      <GV_Footer />
    </div>
  );
};

export default App;