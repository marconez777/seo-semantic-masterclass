import FavoritesTable from "./FavoritesTable";

interface FavoritesTabProps {
  userId: string;
}

const FavoritesTab = ({ userId }: FavoritesTabProps) => {
  return <FavoritesTable userId={userId} />;
};

export default FavoritesTab;