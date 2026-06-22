import { getFormString } from "./helpers"
import type { CreateAddressPayload } from "../services/addresses";

export function getAddressFieldsFromFormData(
  formData: FormData,
): CreateAddressPayload {
  return {
    line1: getFormString(formData, "line1"),
    line2: getFormString(formData, "line2"),
    city: getFormString(formData, "city"),
    stateName: getFormString(formData, "state_name"),
    postalCode: getFormString(formData, "postal_code"),
    country: getFormString(formData, "country"),
  };
}