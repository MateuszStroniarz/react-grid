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
  numer: string;
  ob_TowId: string;
  tc_CenaNetto1: string;
  tc_CenaNetto3: string;
  nazwa: string;
}


const getColumns = (): Column[] => [
  { columnId: "id", width: 150 },
  { columnId: "numer", width: 150 },
  { columnId: "TowID", width: 150 },
  { columnId: "tc_CenaNetto1", width: 150 },
  { columnId: "tc_CenaNetto3", width: 150 },
  { columnId: "nazwa", width: 500 },
];

const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "ID" },
    { type: "header", text: "Numer" },
    { type: "header", text: "TowID" },
    { type: "header", text: "Cena Netto 1" },
    { type: "header", text: "Cena Netto 3" },
    { type: "header", text: "Nazwa" },
  ]
};

const getRows = (products: Product[]): Row[] => [
  headerRow,
  ...products.map<Row>((product, idx) => ({
    rowId: idx,
    cells: [
      { type: "text", text: product.dok_Id.toString() },
      { type: "text", text: product.dok_NrPelny },
      { type: "text", text: product.ob_TowId.toString() },
      { type: "text", text: product.tc_CenaNetto1 },
      { type: "text", text: product.tc_CenaNetto3 },
      { type: "text", text: product.tw_Nazwa },
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
    console.log({ tc_IdTowar: prevPeople[personIndex]["TowID"], [fieldName]: prevPeople[personIndex][fieldName] });
    console.log(personIndex,fieldName, prevPeople[personIndex]["TowID"])
    updateProduct({ tc_IdTowar: prevPeople[personIndex]["tc_IdTowar"], [fieldName]: prevPeople[personIndex][fieldName] });
  });
  return [...prevPeople];
};



function App() {

  const { mutate: updateProduct } = useMutation(data => {
    return fetch('http://83.19.179.106:58585/swiatsuplikopia/sql.php', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tc_IdTowar: data.tc_IdTowar,
        tc_tc_CenaNetto1: data.tc_CenaNetto3,
        tc_tc_CenaNetto3: data.tc_CenaNetto3,
        token: "Y9hCw7trPMm.vNLZX.Fm",
        action: "save"
      })
    })
  })

  const [products, setProducts] = React.useState<Product[]>();

  const columns = getColumns();

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    setProducts((prevPeople) => applyChangesToPeople(changes, prevPeople, updateProduct));
  };

  const [code, setCode] = useState();
  const [name, setName] = useState("Olimp");
  const [dateFrom, setDateFrom] = useState();
  const [dateTo, setDateTo] = useState();

  const { data, status, refetch } = useQuery(["product"], () =>
    fetchProduct(code, name, dateFrom, dateTo)
  );

  // const fetchProduct = async (code, name, dateFrom, dateTo) => {
  //   const response = await fetch(
  //     `http://83.19.179.106:58585/swiatsuplikopia/sql.php`
  //   );
  //   const data = await response.json();
  //   console.log(data)
  //   setProducts(data);
  //   return data;
  // };

  const fetchProduct = async (code, name, dateFrom, dateTo) => {
    const response = await fetch(
      `http://83.19.179.106:58585/swiatsuplikopia/sql.php?token=Y9hCw7trPMm.vNLZX.Fm&action=load`, {
      }
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

  const dateFromHandler = (e) => {
    setDateFrom(e.target.value);
  };

  const dateToHandler = (e) => {
    setDateTo(e.target.value);
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
          <input name="code" id="code" type="text" className={styles.input} placeholder="ID" onChange={codeHandler} value={code} />
        </label>
        <label>
          {/* Nazwa */}
          <input name="name" id="name" type="text" className={styles.input} placeholder="Nazwa" onChange={nameHandler} value={name} />
        </label>

        <input type="date" id="dateFrom" name="dateFrom"  className={styles.input} onChange={dateFromHandler} value={dateFrom}/>
        <input type="date" id="dateTo" name="dateTo"  className={styles.input} onChange={dateToHandler} value={dateTo}/>
        <button type="submit" className={styles.button}>Pobierz</button>
      </form>
      {status === "loading" && <div>Loading...</div>}
      {status === "error" && (
        <div>Error occurred while fetching data</div>
      )}
      {status === "success" && data && <>
        <ReactGrid rows={getRows(products)} enableRowSelection enableColumnSelection enableRangeSelection columns={columns} onCellsChanged={handleChanges} />
      </>
      }
    </section>
  );
}

export default App
