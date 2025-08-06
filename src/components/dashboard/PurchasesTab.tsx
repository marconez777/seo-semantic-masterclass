import PurchasesTable from "./PurchasesTable";
interface PurchasesTabProps {
  userId: string;
}

const PurchasesTab = ({ userId }: PurchasesTabProps) => {
  return <PurchasesTable userId={userId} />;
};

export default PurchasesTab;