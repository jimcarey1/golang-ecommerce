export function parseProductAttributes(formData: FormData) {
  const attributeJSON: Record<string, string> = {};
  const keys = formData.getAll("attribute_keys");
  const values = formData.getAll("attribute_values");

  keys.forEach((key, index) => {
    const normalizedKey = typeof key === "string" ? key.trim() : "";
    const value = values[index];
    const normalizedValue = typeof value === "string" ? value.trim() : "";

    if (normalizedKey && normalizedValue) {
      attributeJSON[normalizedKey] = normalizedValue;
    }
  });

  return attributeJSON;
}
