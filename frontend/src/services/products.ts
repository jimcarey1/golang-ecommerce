import api from "./api"

export interface Product{
    ID : number
    ProductName : string
    ProductDescription : string
    Brand : string
    Price : number
    Mode : "fixed" | "auction"
    Attributes : string
    CategoryID : number
    SubCategoryID : number
    UserID : number
    Images : string[]
    CreatedAt : unknown
    UpdatedAt : unknown
}

export type CreateProductPayload = Omit<Product, "ID" | "CreatedAt" | "UpdatedAt">;

export async function createProduct(data: CreateProductPayload) {
    const response =  await api.post<Product>("/products/add", data)
    return response.data
}

export async function getProductById(productId: number) {
    const response = await api.get<Product>(`/products/${productId}`)
    console.log(response.data)
    return response.data
}
