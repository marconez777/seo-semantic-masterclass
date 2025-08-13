import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MonthlyRevenueFilter = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 max-w-md">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Faturamento Mensal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-1000">Menor que R$ 1.000</SelectItem>
            <SelectItem value="under-2000">Menor que R$ 2.000</SelectItem>
            <SelectItem value="2000-3000">R$ 2.000 a R$ 3.000</SelectItem>
            <SelectItem value="3000-5000">R$ 3.000 a R$ 5.000</SelectItem>
            <SelectItem value="5000-10000">R$ 5.000 a R$ 10.000</SelectItem>
            <SelectItem value="over-10000">Mais de R$ 10.000</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
};

export default MonthlyRevenueFilter;