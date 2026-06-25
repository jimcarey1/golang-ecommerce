export function parseProductAttributes(attributes: string) {
  const attributeJSON: Record<string, string> = {};
  const attributeList = attributes.split("\n");

  for (const attribute of attributeList) {
    const [key, value] = attribute.split("=");
    const normalizedKey = key?.trim();

    if (normalizedKey && value !== undefined) {
      attributeJSON[normalizedKey] = value.trim();
    }
  }

  return attributeJSON;
}
