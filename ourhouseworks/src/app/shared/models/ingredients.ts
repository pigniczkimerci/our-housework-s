export interface Ingredients {
    name: string,
    quantity: number,
    unit: string
}

export interface Group {
    name: string;
    ingredient: Ingredients[];
  }
