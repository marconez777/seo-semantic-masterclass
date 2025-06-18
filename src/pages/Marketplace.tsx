
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import Header from '@/components/layout/Header';
import FilterSidebar from '@/components/layout/FilterSidebar';
import SitesTable from '@/components/layout/SitesTable';

const Marketplace = () => {
  const breadcrumbItems = [
    { name: "Início", url: "/" },
    { name: "Marketplace", url: "/marketplace" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen">
          <FilterSidebar />
          <SitesTable />
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
