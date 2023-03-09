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
import styles from "./app.module.css";
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
  updateProduct
): Product[] => {
  changes.forEach((change) => {
    const personIndex = change.rowId;
    const fieldName = change.columnId;
    prevPeople[personIndex][fieldName] = change.newCell.text;
    updateProduct({ ean: prevPeople[personIndex]["ean"],  [fieldName]:  prevPeople[personIndex][fieldName]});
  });
  return [...prevPeople];
};



function App() {

  const { mutate: updateProduct } = useMutation(data => {
    return fetch('http://localhost:3000/api/products', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  })

  const [products, setProducts] = React.useState<Product[]>();

  const columns = getColumns();

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    setProducts((prevPeople) => applyChangesToPeople(changes, prevPeople, updateProduct));
  };

  const [code, setCode] = useState();
  const [name, setName] = useState("Olimp");

  const { data, status, refetch } = useQuery(["product"], () =>
    fetchProduct(code, name)
  );

  const fetchProduct = async (code, name) => {
    const response = await fetch(
      `http://localhost:3000/api/products?code=${code}&name=${name}`
    );
    const data = await response.json();
    console.log(data)
    setProducts(data);
    return data;
  };

  const codeHandler = (e) => {
    setCode(e.target.value);
  };

  const nameHandler = (e) => {
    setName(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setCode(e.target.code.value);
    setName(e.target.name.value);
    refetch();
  };

  return (
    <section>
      <form className={styles.postForm} onSubmit={submitHandler}>
        <legend>Fetching form</legend>
        <label>
          {/* EAN */}
          <input name="code" id="code" type="text" className={styles.input} placeholder="EAN" onChange={codeHandler} value={code}/>
        </label>
        <label>
          {/* Nazwa */}
          <input name="name" id="name" type="text" className={styles.input} placeholder="Nazwa" onChange={nameHandler} value={name} />
        </label>
        <button type="submit" className={styles.button}>Pobierz</button>
      </form>
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
