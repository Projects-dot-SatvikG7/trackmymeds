import { useQuery, gql, useMutation } from "@apollo/client";
import "./App.css";
import { useEffect, useState } from "react";
const GET_RECORDS = gql`
  query Records {
    queryRecord {
      id
      date
      symptom
    }
  }
`;

const ADD_RECORD = gql`
  mutation MyMutation($date: String!, $symptoms: [Symptom!]!) {
    addRecord(input: { date: $date, symptom: $symptoms }) {
      record {
        id
        date
        symptom
      }
    }
  }
`;

const DELETE_RECORD = gql`
  mutation MyMutation($id: [ID!]!) {
    deleteRecord(filter: { id: $id }) {
      record {
        id
        date
        symptom
        __typename
      }
    }
  }
`;

function AddData({ data, setData }) {
  const [addDataFunction, { data: mutatedData, loading, error }] =
    useMutation(ADD_RECORD);
  const [props, setProps] = useState([
    ["itching", 0],
    ["watery_eyes", 0],
    ["runny_nose", 0],
    ["sneezing", 0],
    ["nasal_inflammation", 0],
    ["swollen_throat", 0],
  ]);
  useEffect(() => {
    if (mutatedData?.addRecord?.record.length) {
      console.log(data);
      let newData = [...data, mutatedData.addRecord.record[0]];
      setData(newData);
    }
    // eslint-disable-next-line
  }, [mutatedData]);
  const toggle = (idx) => {
    let temp = [...props];
    temp[idx][1] = 1 - temp[idx][1];
    setProps(temp);
  };
  const addRecord = () => {
    function getDifferenceInHours(dateString1, dateString2) {
      const date1 = new Date(dateString1);
      const date2 = new Date(dateString2);

      const differenceInMilliseconds = date2.getTime() - date1.getTime();
      const differenceInHours = differenceInMilliseconds / 3600000;

      return differenceInHours;
    }

    let date = new Date().toLocaleString();
    if (
      data.length &&
      getDifferenceInHours(data[data.length - 1].date, date) < 6
    ) {
      alert(
        "You cannot take medicine in less than 6 hours of your previous dose."
      );
      return;
    }
    let symptoms = props.filter((prop) => prop[1]).map((prop) => prop[0]);
    console.log(date, symptoms);
    addDataFunction({ variables: { date, symptoms } });
  };
  return (
    <div className="form-flex">
      <h2>Select Symptoms</h2>
      <div className="btn-flex">
        {props.map((prop, idx) => (
          <button
            key={idx}
            className={"btn" + (prop[1] ? " selected" : "")}
            onClick={() => toggle(idx)}
          >
            {prop[0].replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <button onClick={() => addRecord()} className="btn btn-process">
        {loading ? "Recording..." : "Record Dose"}
      </button>
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}

function DeleteSelected({ record, setRecord, selectedRecord, setSelected }) {
  const [deleteRecordFunction, { data: deletedRecord, loading, error }] =
    useMutation(DELETE_RECORD);
  useEffect(() => {
    if (deletedRecord?.deleteRecord?.record.length) {
      let newArr = selectedRecord.filter((r) => {
        let bool = true;
        deletedRecord.deleteRecord.record.map((y) => {
          if (y.id === r) {
            bool = false;
          }
          return true;
        });
        return bool;
      });
      setSelected(newArr);

      newArr = record.filter((x) => {
        let bool = true;
        deletedRecord.deleteRecord.record.map((y) => {
          if (y.id === x.id) {
            bool = false;
          }
          return true;
        });
        return bool;
      });
      setRecord(newArr);
    }
  }, [setRecord, record, setSelected, selectedRecord, deletedRecord]);
  const deleteRecord = () => {
    deleteRecordFunction({ variables: { id: selectedRecord } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <button onClick={() => deleteRecord()} className="btn btn-delete">
      Delete Records
    </button>
  );
}
function DisplayRecords({
  loading,
  error,
  record,
  setRecord,
  select,
  setSelected,
}) {
  const toggleRecord = (e, id) => {
    if (e.target.checked) {
      setSelected([...select, id]);
    } else {
      setSelected(select.filter((x) => x !== id));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  if (record?.length) {
    return (
      <div id="table-wrapper">
        <table id="records">
          <thead>
            <tr>
              <th>
                {select.length ? (
                  <DeleteSelected
                    record={record}
                    setRecord={setRecord}
                    selectedRecord={select}
                    setSelected={setSelected}
                  />
                ) : (
                  "Select"
                )}
              </th>
              <th>Sr. No.</th>
              {/* <th>ID</th> */}
              <th>Date</th>
              <th>Symptoms</th>
            </tr>
          </thead>
          <tbody>
            {record.map((record, idx) => (
              <tr key={record.id}>
                <td>
                  <input
                    onChange={(e) => toggleRecord(e, record.id)}
                    type="checkbox"
                  ></input>
                </td>
                <td>{idx + 1}</td>
                {/* <td>{record.id}</td> */}
                <td>{record.date}</td>
                <td>
                  <ul>
                    {record.symptom.map((s) => (
                      <li key={s}>{s.replaceAll("_", " ")}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <h1>Start Recording Data</h1>;
}

export default function App() {
  const { loading, error, data } = useQuery(GET_RECORDS);
  const [dataRecord, setData] = useState(data);
  const [selectedRecord, setSelected] = useState([]);

  useEffect(() => {
    setData(data?.queryRecord);
  }, [data]);
  return (
    <div>
      <h1>TrackMyMeds</h1>
      <AddData data={dataRecord} setData={setData} />
      <DisplayRecords
        loading={loading}
        error={error}
        record={dataRecord}
        setRecord={setData}
        select={selectedRecord}
        setSelected={setSelected}
      />
    </div>
  );
}
