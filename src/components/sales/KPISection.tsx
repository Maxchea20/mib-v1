type Props = {
  deals: any[];
};

export default function KPISection({
  deals,
}: Props) {

  const gross = deals.reduce((sum, deal) => {

    const grossCommission =
      Number(deal.gross_commission);

    if (!isNaN(grossCommission) && grossCommission > 0) {
      return sum + grossCommission;
    }

    const sellingPrice =
      Number(deal.selling_price) || 0;

    const commissionRate =
      Number(deal.commission_rate) || 0;

    return sum + (sellingPrice * commissionRate / 100);

  }, 0);

  const net = deals.reduce((sum, deal) => {

    const netCommission =
      Number(deal.net_commission);

    if (!isNaN(netCommission) && netCommission > 0) {
      return sum + netCommission;
    }

    const sellingPrice =
      Number(deal.selling_price) || 0;

    const commissionRate =
      Number(deal.commission_rate) || 0;

    return sum + (sellingPrice * commissionRate / 100);

  }, 0);

  const pending = deals.filter((deal) => {

    const status =
      String(deal.status ?? "").toLowerCase();

    return (
      status !== "claimed" &&
      status !== "completed"
    );

  }).length;

  return (

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <Card
        title="Gross Commission"
        value={`RM ${gross.toLocaleString(undefined,{
          minimumFractionDigits:2,
          maximumFractionDigits:2,
        })}`}
      />

      <Card
        title="Net Commission"
        value={`RM ${net.toLocaleString(undefined,{
          minimumFractionDigits:2,
          maximumFractionDigits:2,
        })}`}
      />

      <Card
        title="Deals"
        value={deals.length}
      />

      <Card
        title="Pending"
        value={pending}
      />

    </div>

  );

}

function Card({
  title,
  value,
}:{
  title:string;
  value:string|number;
}){

  return(

    <div className="rounded-xl border bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-black">
        {value}
      </h2>

    </div>

  );

}