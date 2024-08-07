import { gql } from "@apollo/client";

export const MUTATION_LOGIN = gql`
  mutation Login($email: String, $password: String) {
    login(email: $email, password: $password) {
      token
      oauthUrl
    }
  }
`;

export const GET_SERVICES = gql`
  query GetAirport {
    getService {
      type
    }
  }
`;

export const GET_AIRPORTS = gql`
  query GetAirport {
    getAirport {
      city
      airport
      iataCode
    }
  }
`;

export const MUTATION_ADD_ORDER = gql`
  mutation Mutation($input: CreateOrderInput) {
    addOrder(input: $input) {
      _id
      fullname
      email
      phoneNumber
      origin
      destination
      service
      pax
      status
      createdAt
      updatedAt
    }
  }
`;
