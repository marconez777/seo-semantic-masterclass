
import { useState } from 'react';
import { Globe, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Site {
  id: number;
  domain: string;
  dr: number;
  lrd: number;
  languages: string[];
  topics: { name: string; count: number; color: string }[];
  price: { original: number; discounted?: number };
}

const SitesTable = () => {
  const [sites] = useState<Site[]>([
    {
      id: 36508,
      domain: '******.com',
      dr: 9,
      lrd: 0,
      languages: ['pt'],
      topics: [
        { name: 'Business/Publishing and Printing', count: 18, color: 'bg-red-500' }
      ],
      price: { original: 25, discounted: 12 }
    },
    {
      id: 36554,
      domain: '*********.tv',
      dr: 1,
      lrd: 16,
      languages: ['en'],
      topics: [
        { name: 'Arts/Television', count: 11, color: 'bg-red-500' },
        { name: 'Games/Video Games/Roleplaying', count: 9, color: 'bg-red-500' },
        { name: 'Science/Technology', count: 4, color: 'bg-red-500' }
      ],
      price: { original: 15, discounted: 7 }
    },
    {
      id: 36561,
      domain: '*********.com',
      dr: 9,
      lrd: 0,
      languages: ['en'],
      topics: [
        { name: 'Recreation/Travel', count: 13, color: 'bg-red-500' },
        { name: 'Science/Astronomy', count: 8, color: 'bg-red-500' },
        { name: 'Shopping/Holidays', count: 8, color: 'bg-red-500' }
      ],
      price: { original: 10, discounted: 5 }
    },
    {
      id: 36581,
      domain: '*********.com',
      dr: 1,
      lrd: 9,
      languages: ['en'],
      topics: [
        { name: 'Society/Politics', count: 10, color: 'bg-red-500' },
        { name: 'Society/Religion and Spirituality', count: 5, color: 'bg-red-500' },
        { name: 'Society', count: 5, color: 'bg-red-500' }
      ],
      price: { original: 10, discounted: 5 }
    },
    {
      id: 36618,
      domain: '***_***.com',
      dr: 6,
      lrd: 21,
      languages: ['fr'],
      topics: [
        { name: 'Recreation/Travel', count: 19, color: 'bg-red-500' },
        { name: 'Computers/Internet/Searching', count: 7, color: 'bg-red-500' }
      ],
      price: { original: 19, discounted: 5 }
    }
  ]);

  const getLanguageFlag = (lang: string) => {
    const flags: { [key: string]: string } = {
      'pt': '🇧🇷',
      'en': '🇺🇸',
      'fr': '🇫🇷',
      'es': '🇪🇸'
    };
    return flags[lang] || '🌐';
  };

  return (
    <div className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Sites Disponíveis</h2>
          <p className="text-sm text-gray-600 mt-1">
            {sites.length} sites encontrados
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>DR</TableHead>
                <TableHead>LRD</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead className="min-w-[300px]">Majestic Topics</TableHead>
                <TableHead>Price</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input type="checkbox" className="h-4 w-4 text-blue-600" />
                  </TableCell>
                  <TableCell className="font-medium">{site.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Globe className="w-4 h-4" />
                      <span>{site.domain}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-center font-medium">
                      {site.dr}
                    </div>
                  </TableCell>
                  <TableCell>{site.lrd}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {site.languages.map((lang, index) => (
                        <span key={index} className="text-lg">
                          {getLanguageFlag(lang)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {site.topics.map((topic, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className={`${topic.color} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                            {topic.count}
                          </span>
                          <span className="text-sm text-gray-700">{topic.name}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      {site.price.discounted && (
                        <div className="text-lg font-bold text-gray-400 line-through">
                          ${site.price.original}
                        </div>
                      )}
                      <div className="text-lg font-bold text-green-600">
                        ${site.price.discounted || site.price.original}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SitesTable;
