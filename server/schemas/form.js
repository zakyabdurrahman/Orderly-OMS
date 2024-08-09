const createFlight = require("../helpers/flightCalculation");
const {
  createOrder,
  updateOrder,
  findAllOrder,
  findOrderById,
  findAllService,
  findAllAirports,
  findServiceById,
  findServiceTypeByQuery,
  findAirportByQuery,
  OrderTable,
} = require("../models/form");
const { createError } = require("../helpers/helpers");

const { sendMail } = require("../helpers/mailer");
const { aircraftCard } = require("../helpers/emailComponents");
const { ObjectId } = require("mongodb");
const CLIENT_URL = require("../helpers/clientUrl");

const typeDefs = `#graphql
  type Order {
    _id: ID
    fullname: String
    email: String    
    phoneNumber: String
    origin: String
    destination: String
    service: String
    pax: Int
    status: String
    price: Int
    aircraft: String
    createdAt: String
    updatedAt: String
    reason: String
  }

  type Airport {
    city: String
    airport: String
    iataCode: String
  }

  type Service {
    type: String
    assets: [Asset]
  }

  type Asset {
    name: String
    speed: Int
    pricePerHour: Int
    seatCapacity: Int
  }

  input CreateOrderInput {
    fullname: String!
    email: String!    
    phoneNumber: String!
    origin: String!
    destination: String!
    service: String!
    pax: Int!
  }

  type Query {
    getAirport: [Airport]
    getAirportByQuery(query: String): [Airport]       
    getService: [Service]
    getServiceById(id: ID): Service
    getServiceTypeByQuery(query: String): [Service]
    getOrder: [Order]
    getOrderById(id: ID): Order
  }

  type Mutation {
    addOrder(input: CreateOrderInput): Order
    updateStatusOrder(id: ID, status: String): Order
    updateOrderData(id: ID, price: Int, aircraft: String, status: String) : String
  }
`;

const resolvers = {
  Query: {
    // Function untuk mendapatkan List semua Order
    getOrder: async (_parent, _args, contextValue) => {
      const userLogin = await contextValue.authentication();
      const orders = await findAllOrder();
      return orders;
    },

    // Function untuk mendapatkan Order berdasarkan Idnya
    getOrderById: async (_parent, args) => {
      const { id } = args;
      const order = await findOrderById(id);
      return order;
    },

    // Function untuk mendapatkan List semua Service
    getService: async () => {
      const services = await findAllService();
      return services;
    },

    getServiceById: async (_parent, args) => {
      const { id } = args;
      const service = await findServiceById(id);
      return service;
    },

    getServiceTypeByQuery: async (_parent, args) => {
      const { query } = args;
      const service = await findServiceTypeByQuery(query);
      return service;
    },

    // Function untuk mendapatkan List semua Airport
    getAirport: async () => {
      const airports = await findAllAirports();
      return airports;
    },

    getAirportByQuery: async (_parent, args) => {
      const { query } = args;
      const airport = await findAirportByQuery(query);

      return airport;
    },
  },

  Mutation: {
    // Function Add Order
    addOrder: async (_parent, args) => {
      try {
        const {
          fullname,
          email,
          phoneNumber,
          origin,
          destination,
          service,
          pax,
        } = args.input;

        const offerData = await createFlight(origin, destination, service, pax);
        /*
        if (orderData.length === 0) {
          throw createError("No Aircraft was found", 400);
        }
          */
        console.log(offerData);
        console.log("************************");

        const orderData = await createOrder({
          fullname,
          email,
          phoneNumber,
          origin,
          destination,
          service,
          pax,
          offers: offerData,
          status: "Pending",
          price: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          reason: "",
        });

        let cards = "";

        offerData.forEach((e) => {
          cards += aircraftCard(
            e.serviceType,
            e.assetName,
            e.price,
            e.flightTimeInMinutes,
            orderData._id.toString()
          );
        });

        let emailContent = `
         <p>
          Dear ${fullname}, Thank you for considering Orderly for your private
          jet charter needs. We are thrilled to offer you the luxury, comfort, and
          flexibility that our service is known for. To ensure your experience is
          perfectly tailored to your preferences, we provide a range of charter
          options for ${service} flight. Please review the options below
          and select the one that you find most suitable:
        </p>
        <table style="border-collapse: collapse; width: 100%">
          <tr style="background-color: #f2f2f2">
            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px">
              Aircraft
            </th>
            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px">
              Total Flight Time
            </th>
            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px">
              Price
            </th>
          </tr>
          ${cards} 
          
        </table>
          <a href="${CLIENT_URL}/accept/${orderData._id.toString()}">
            <button
              style="
                background-color: #119125;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 20px;
              "
            >
              Proceed
            </button>
          </a>
          <a href="${CLIENT_URL}/reject/${orderData._id.toString()}">
            <button
              style="
                background-color: #cf0808;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 20px;
              "
            >
              Reject
            </button>
          </a>`;
        await sendMail(emailContent, email, "Service Offer");
        console.log("email send(?)");

        return orderData;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    // Function Update Status Order
    updateStatusOrder: async (_parent, args) => {
      const { id, status } = args;
      console.log(status, id);

      const orderData = await updateOrder(id, status);

      return orderData;
    },

    updateOrderData: async (_parent, args) => {
      const { id, price, aircraft, status } = args;
      const orders = await OrderTable();
      await orders.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            price,
            aircraft,
            status,
          },
        }
      );
      return "Success update order data";
    },
  },
};

module.exports = {
  formTypeDefs: typeDefs,
  formResolvers: resolvers,
};
