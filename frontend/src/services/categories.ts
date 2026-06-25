import api from "./api";

export interface Category {
  ID: number;
  CategoryName: string;
  ImageUrl?: string;
  ParentID?: number;
}

export interface CreateCategoryPayload {
  CategoryName: string;
  ImageUrl?: string;
  ParentID?: number;
}

export async function getParentCategories() {
  const response = await api.get<Category[]>("/category/parents");

  return response.data;
}

export async function getSubCategories(categoryId: number) {
  const response = await api.get<Category[]>(
    `/category/${categoryId}/children`,
  );

  return response.data;
}

export async function createCategory(payload: CreateCategoryPayload) {
  console.log(payload)
  const response = await api.post<Category>("/category/add", payload);

  return response.data;
}
