import api from "./api.ts";

type ApiTextField =
  | string
  | {
      String?: string;
      Valid?: boolean;
    }
  | null
  | undefined;

interface AddressApiResponse {
  ID?: number;
  id?: number;
  Line1?: string;
  line1?: string;
  Line2?: ApiTextField;
  line2?: ApiTextField;
  City?: string;
  city?: string;
  StateName?: string;
  stateName?: string;
  state_name?: string;
  PostalCode?: string;
  postalCode?: string;
  postal_code?: string;
  Country?: string;
  country?: string;
  UserID?: number;
  userId?: number;
  user_id?: number;
  IsPrimary?: boolean;
  isPrimary?: boolean;
  is_primary?: boolean;
}

export interface Address {
  id?: number;
  line1: string;
  line2: string;
  city: string;
  stateName: string;
  postalCode: string;
  country: string;
  userId?: number;
  isPrimary?: boolean;
}

export interface CreateAddressPayload {
  line1: string;
  line2: string;
  city: string;
  stateName: string;
  postalCode: string;
  country: string;
}

function getTextField(value: ApiTextField) {
  if (typeof value === "string") return value;
  if (!value?.Valid) return "";

  return value.String ?? "";
}

function normalizeAddress(address: AddressApiResponse): Address {
  return {
    id: address.id ?? address.ID,
    line1: address.line1 ?? address.Line1 ?? "",
    line2: getTextField(address.line2 ?? address.Line2),
    city: address.city ?? address.City ?? "",
    stateName: address.stateName ?? address.state_name ?? address.StateName ?? "",
    postalCode:
      address.postalCode ?? address.postal_code ?? address.PostalCode ?? "",
    country: address.country ?? address.Country ?? "",
    userId: address.userId ?? address.user_id ?? address.UserID,
    isPrimary: address.isPrimary ?? address.is_primary ?? address.IsPrimary,
  };
}

export async function getUserAddresses(userId: number): Promise<Address[]> {
  const response = await api.get<AddressApiResponse[]>(`/user/${userId}/addresses`);

  return response.data.map(normalizeAddress);
}

export async function createAddress(
  payload: CreateAddressPayload,
  userId: number,
): Promise<Address> {
  const response = await api.post<AddressApiResponse>(
    `/user/${userId}/addresses/add`,
    {
      Line1: payload.line1,
      Line2: payload.line2,
      City: payload.city,
      StateName: payload.stateName,
      PostalCode: payload.postalCode,
      Country: payload.country,
    },
  );

  return normalizeAddress(response.data);
}
