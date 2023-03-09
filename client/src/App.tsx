import * as React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation } from "react-query";
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

interface Product {
  id: string;
  sku: string;
  ean: string;
  nazwa: string;
  grupa: string;
  ean2: string;
  to_update: string;
  polka: string;
}


const getColumns = (): Column[] => [
  { columnId: "id", width: 150 },
  { columnId: "sku", width: 150 },
  { columnId: "ean", width: 150 },
  { columnId: "nazwa", width: 150 },
  { columnId: "grupa", width: 150 },
  { columnId: "ean2", width: 150 },
  { columnId: "to_update", width: 150 },
  { columnId: "polka", width: 150 }
];

const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "id" },
    { type: "header", text: "sku" },
    { type: "header", text: "ean" },
    { type: "header", text: "nazwa" },
    { type: "header", text: "grupa" },
    { type: "header", text: "ean2" },
    { type: "header", text: "to_update" },
    { type: "header", text: "polka" }
  ]
};

const getRows = (products: Product[]): Row[] => [
  headerRow,
  ...products.map<Row>((product, idx) => ({
    rowId: idx,
    cells: [
      { type: "text", text: product.id.toString() },
      { type: "text", text: product.sku },
      { type: "text", text: product.ean },
      { type: "text", text: product.nazwa },
      { type: "text", text: product.grupa },
      { type: "text", text: product.ean2 },
      { type: "text", text: product.to_update.toString() },
      { type: "text", text: product.polka }
    ]
  }))
];




const applyChangesToPeople = (
  changes: CellChange<TextCell>[],
  prevPeople: Product[],
  addProduct
): Product[] => {
  changes.forEach((change) => {
    const personIndex = change.rowId;
    const fieldName = change.columnId;
    prevPeople[personIndex][fieldName] = change.newCell.text;
    addProduct({ ean: prevPeople[personIndex]["ean"],  [fieldName]:  prevPeople[personIndex][fieldName]});
    console.log(prevPeople[personIndex][fieldName], personIndex, fieldName, prevPeople[personIndex]["ean"]);
  });
  return [...prevPeople];
};



function App() {

  const { mutate: addProduct } = useMutation(data => {
    return fetch('http://localhost:3000/api/test', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  })

  const [products, setProducts] = React.useState<Product[]>();

  // const rows = getRows(people);
  const columns = getColumns();

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    setProducts((prevPeople) => applyChangesToPeople(changes, prevPeople, addProduct));
  };

  const [code, setCode] = useState();
  const [name, setName] = useState("Olimp");

  const { data, status, refetch } = useQuery(["product", code], () =>
    fetchProduct(code, name)
  );

  const fetchProduct = async (code, name) => {
    const response = await fetch(
      `http://localhost:3000/api/skaner?code=${code}&name=${name}`
    );
    const data = await response.json();
    console.log(data)
    setProducts(data);
    return data;
  };

  return (
    <section>
      {status === "loading" && <div>Loading...</div>}
      {status === "error" && (
        <div>Error occurred while fetching data</div>
      )}
      {status === "success" && data && <>
        <ReactGrid rows={getRows(products)} columns={columns} onCellsChanged={handleChanges} />
      </>
      }
    </section>
  );
}

export default App