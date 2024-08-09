import { Button } from "@material-tailwind/react";
import formatPrice from "../utils/formatDollar";
import { useQuery } from "@apollo/client";
import { QUERY_ORDER_BY_ID } from "../queries";
import { useParams } from "react-router-dom";

export function AcceptOrder({ route }) {
  const { orderId } = useParams();
  //   console.log(orderId);

  const { loading, error, data } = useQuery(QUERY_ORDER_BY_ID, {
    variables: {
      getOrderByIdId: orderId,
    },
  });
  //   console.log(data?.getOrderById);

  const order = data?.getOrderById;

  //   const data = {
  //     _id: "66b4a0aeed2e1c5f2e0b702b",
  //     fullname: "jajang",
  //     email: "jajang@mail.com",
  //     phoneNumber: "12345",
  //     origin: "DJJ",
  //     destination: "BTJ",
  //     service: "VIP",
  //     aircraft: "Gulfstream G150",
  //     price: "5000",
  //   };
  //   console.log(data);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-purple-800 p-6">
          <h1 className="text-3xl font-bold text-white">Confirm Service Order</h1>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Name</h2>
              <p className="text-gray-600">{order?.fullname}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Aircraft</h2>
              <p className="text-gray-600">{order?.aircraft}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Departure</h2>
              <p className="text-gray-600">{order?.origin}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Arrival</h2>
              <p className="text-gray-600">{order?.destination}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Price</h2>
              <p className="text-gray-600">{formatPrice(order?.price)}</p>
            </div>
          </div>
        </div>
        <div className="p-6 m-auto  w-fit">
          <Button className="w-full bg-green-600">Confirm</Button>
        </div>
      </div>
    </div>
  );
}