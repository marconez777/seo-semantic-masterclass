
import MKArtHeader from './MKArtHeader';
import ServicesSidebar from './ServicesSidebar';
import Breadcrumbs from '../seo/Breadcrumbs';
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  breadcrumbItems: { name: string; url: string }[];
  showSidebar?: boolean;
}

const PageLayout = ({ children, breadcrumbItems, showSidebar = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MKArtHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen">
          {showSidebar && <ServicesSidebar />}
          <main className={showSidebar ? "flex-1" : "w-full"} role="main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
