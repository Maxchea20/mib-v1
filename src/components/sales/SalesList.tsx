type Props = {
  deals: any[];
};

export default function SalesList({ deals }: Props) {
  return (
    <div className="bg-white rounded-xl border p-6">
      Sales List
      <br />
      Total Deals: {deals.length}
    </div>
  );
}