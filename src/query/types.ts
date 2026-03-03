export type Dir = "UP" | "DOWN";

export type Order =
  | string
  | {
      dir: Dir;
      keys: string[];
    };

export type Query = {
  WHERE: any;
  OPTIONS: {
    COLUMNS: string[];
    ORDER?: Order;
  };
  TRANSFORMATIONS?: {
    GROUP: string[];
    APPLY: any[];
  };
};

export type Row = Record<string, any>;
