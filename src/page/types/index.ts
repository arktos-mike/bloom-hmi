export interface ITableHeader {
  header: string;
  key: string;
  width: number;
  parentKey?: string;
  children?: ITableHeader[];
}

export interface IStyleAttr {
  color?: string;
  fontSize?: number;
  horizontal?: 'fill' | 'distributed' | 'justify' | 'center' | 'left' | 'right' | 'centerContinuous' | undefined;
  bold?: boolean;
}
